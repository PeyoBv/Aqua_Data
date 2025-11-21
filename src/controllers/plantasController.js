const dataStore = require('../data/dataStore');
const { normalizarTexto, parsearEntero } = require('../utils/normalizar');

/**
 * Controlador para el módulo de Plantas de Procesamiento
 * Endpoints especializados para análisis de infraestructura industrial
 */

/**
 * GET /api/v1/plantas/estadisticas
 * KPIs generales: Plantas Únicas, Líneas Instaladas
 */
exports.getEstadisticas = (req, res) => {
  try {
    const { region, anio } = req.query;
    let datos = dataStore.getPlantas();

    // Aplicar filtros
    if (anio) {
      const anioNum = parsearEntero(anio);
      datos = datos.filter(item => item.año === anioNum);
    }
    if (region && region !== 'TODAS') {
      const regionNorm = normalizarTexto(region);
      datos = datos.filter(item => item.region === regionNorm);
    }

    // KPI 1: Plantas Únicas (valores únicos de nombre de planta)
    const plantasUnicas = new Set();
    datos.forEach(item => {
      if (item.planta && item.planta !== 'SIN NOMBRE') {
        plantasUnicas.add(item.planta);
      }
    });

    // KPI 2: Líneas Instaladas (total de registros)
    const lineasInstaladas = datos.length;

    res.json({
      success: true,
      data: {
        plantasUnicas: plantasUnicas.size,
        lineasInstaladas: lineasInstaladas
      }
    });
  } catch (error) {
    console.error('❌ Error en getEstadisticas plantas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de plantas',
      error: error.message
    });
  }
};

/**
 * GET /api/v1/plantas/evolucion-tecnologica
 * Evolución Tecnológica: Stacked Bar Chart por Año y Línea de Producción
 * Retorna: [{año, L2, L3, L4, ...}, ...]
 */
exports.getEvolucionTecnologica = (req, res) => {
  try {
    const { region } = req.query;
    let datos = dataStore.getPlantas();

    // Aplicar filtros
    if (region && region !== 'TODAS') {
      const regionNorm = normalizarTexto(region);
      datos = datos.filter(item => item.region === regionNorm);
    }

    // Agrupar por año y línea de elaboración
    const agrupacion = {};
    const lineasSet = new Set();

    datos.forEach(item => {
      const año = item.año;
      const linea = item.nm_linea || item.tipo_elaboracion || 'SIN LINEA';

      if (!agrupacion[año]) {
        agrupacion[año] = {};
      }
      if (!agrupacion[año][linea]) {
        agrupacion[año][linea] = 0;
      }
      agrupacion[año][linea]++;
      lineasSet.add(linea);
    });

    // Convertir a formato para StackedBarChart y filtrar valores 0
    const resultado = Object.keys(agrupacion)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(año => {
        const entry = { año: parseInt(año) };
        Object.keys(agrupacion[año]).forEach(linea => {
          const valor = agrupacion[año][linea];
          // Solo agregar si el valor es mayor que 0
          if (valor > 0) {
            entry[linea] = valor;
          }
        });
        return entry;
      });

    res.json({
      success: true,
      data: resultado,
      metadata: {
        lineas: Array.from(lineasSet).sort(),
        años: Object.keys(agrupacion).map(a => parseInt(a)).sort((a, b) => a - b)
      }
    });
  } catch (error) {
    console.error('❌ Error en getEvolucionTecnologica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evolución tecnológica',
      error: error.message
    });
  }
};

/**
 * GET /api/v1/plantas/distribucion-procesos
 * Distribución de Procesos: Agrupa por Línea de Producción
 * Retorna: [{name, value, percentage}, ...]
 */
exports.getDistribucionProcesos = (req, res) => {
  try {
    const { region, anio } = req.query;
    let datos = dataStore.getPlantas();

    // Aplicar filtros
    if (anio) {
      const anioNum = parsearEntero(anio);
      datos = datos.filter(item => item.año === anioNum);
    }
    if (region && region !== 'TODAS') {
      const regionNorm = normalizarTexto(region);
      datos = datos.filter(item => item.region === regionNorm);
    }

    // Agrupar por línea de elaboración
    const agrupacion = {};
    datos.forEach(item => {
      const linea = item.nm_linea || item.tipo_elaboracion || 'SIN LINEA';
      if (!agrupacion[linea]) {
        agrupacion[linea] = 0;
      }
      agrupacion[linea]++;
    });

    // Calcular total para porcentajes
    const total = Object.values(agrupacion).reduce((sum, val) => sum + val, 0);

    // Convertir a formato [{name, value, percentage}]
    const resultado = Object.entries(agrupacion)
      .map(([linea, count]) => ({
        name: linea,
        value: count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      data: resultado,
      metadata: {
        total: total,
        lineasUnicas: resultado.length
      }
    });
  } catch (error) {
    console.error('❌ Error en getDistribucionProcesos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribución de procesos',
      error: error.message
    });
  }
};

/**
 * GET /api/v1/plantas/top-complejos
 * Top Complejos Industriales: Plantas con más líneas distintas
 * Retorna: [{name, value}, ...] (Top 10)
 */
exports.getTopComplejos = (req, res) => {
  try {
    const { region, anio, top_n = 10 } = req.query;
    let datos = dataStore.getPlantas();

    // Aplicar filtros
    if (anio) {
      const anioNum = parsearEntero(anio);
      datos = datos.filter(item => item.año === anioNum);
    }
    if (region && region !== 'TODAS') {
      const regionNorm = normalizarTexto(region);
      datos = datos.filter(item => item.region === regionNorm);
    }

    // Agrupar por planta y contar líneas distintas
    const agrupacion = {};
    datos.forEach(item => {
      const planta = item.planta || 'SIN NOMBRE';
      const linea = item.nm_linea || item.tipo_elaboracion || 'SIN LINEA';

      if (!agrupacion[planta]) {
        agrupacion[planta] = new Set();
      }
      agrupacion[planta].add(linea);
    });

    // Convertir a array y contar tamaño del Set
    const resultado = Object.entries(agrupacion)
      .map(([planta, lineasSet]) => ({
        name: planta,
        value: lineasSet.size
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, parseInt(top_n));

    res.json({
      success: true,
      data: resultado,
      metadata: {
        total: Object.keys(agrupacion).length,
        top_n: parseInt(top_n)
      }
    });
  } catch (error) {
    console.error('❌ Error en getTopComplejos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener top complejos industriales',
      error: error.message
    });
  }
};

/**
 * GET /api/v1/plantas/opciones
 * Obtiene opciones disponibles para filtros
 */
exports.getOpciones = (req, res) => {
  try {
    const datos = dataStore.getPlantas();

    const años = new Set();
    const regiones = new Set();
    const lineas = new Set();

    datos.forEach(item => {
      if (item.año) años.add(item.año);
      if (item.region) regiones.add(item.region);
      if (item.nm_linea) lineas.add(item.nm_linea);
    });

    res.json({
      success: true,
      data: {
        años: Array.from(años).sort((a, b) => b - a),
        regiones: Array.from(regiones).sort(),
        lineas: Array.from(lineas).sort()
      }
    });
  } catch (error) {
    console.error('❌ Error en getOpciones plantas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener opciones',
      error: error.message
    });
  }
};
