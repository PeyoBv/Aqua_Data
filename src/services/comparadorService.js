const dataStore = require('../data/dataStore');
const { normalizarTexto, normalizarRegion } = require('../utils/normalizar');

/**
 * Servicio para el módulo Comparador
 * Cruza datos de Cosechas (df_desembarque) con Producción (df_produccion)
 */
class ComparadorService {

  /**
   * Obtiene especies que existen en ambos datasets (Cosechas y Producción)
   * ACTUALIZADO: Usa LEFT JOIN (base = desembarques) para mostrar especies
   * capturadas incluso si NO fueron procesadas (datos reales vs "datos bonitos")
   */
  static obtenerEspeciesComunes() {
    try {
      const df_desembarque = dataStore.getDesembarques();
      const df_produccion = dataStore.getMateriaPrimaProduccion();

      if (!df_desembarque || !df_produccion || df_desembarque.length === 0 || df_produccion.length === 0) {
        return {
          success: false,
          error: 'Datasets no disponibles',
          especies: []
        };
      }

      // Obtener especies únicas de cada dataset
      const especiesCosechas = new Set(
        df_desembarque.map(row => normalizarTexto(row.especie)).filter(Boolean)
      );

      const especiesProduccion = new Set(
        df_produccion.map(row => normalizarTexto(row.especie)).filter(Boolean)
      );

      // ========================================
      // CAMBIO CRÍTICO: LEFT JOIN (no INNER JOIN)
      // ========================================
      // Retornar TODAS las especies capturadas (base = desembarques)
      // Esto incluye especies que NUNCA fueron procesadas (0% eficiencia)
      const todasEspecies = [...especiesCosechas].sort();

      // Clasificar especies para métricas
      const especiesConProcesamiento = todasEspecies.filter(especie =>
        especiesProduccion.has(especie)
      );
      const especiesSinProcesamiento = todasEspecies.filter(especie =>
        !especiesProduccion.has(especie)
      );

      console.log('📊 [Comparador] Especies Capturadas:', todasEspecies.length);
      console.log('✅ [Comparador] Con Procesamiento:', especiesConProcesamiento.length);
      console.log('❌ [Comparador] SIN Procesamiento:', especiesSinProcesamiento.length);
      console.log('🔍 [Comparador] Ejemplos sin procesar:', especiesSinProcesamiento.slice(0, 5));

      return {
        success: true,
        total: todasEspecies.length,
        especies: todasEspecies, // TODAS las capturadas (LEFT JOIN)
        estadisticas: {
          totalCapturadas: todasEspecies.length,
          conProcesamiento: especiesConProcesamiento.length,
          sinProcesamiento: especiesSinProcesamiento.length,
          porcentajeProcesado: todasEspecies.length > 0
            ? ((especiesConProcesamiento.length / todasEspecies.length) * 100).toFixed(1)
            : 0
        }
      };

    } catch (error) {
      console.error('Error en obtenerEspeciesComunes:', error);
      return {
        success: false,
        error: error.message,
        especies: []
      };
    }
  }

  /**
   * Obtiene datos de trazabilidad para una especie específica
   * Cruza Desembarques (Oferta) con Materia Prima en Plantas (Demanda)
   */
  static obtenerTrazabilidad(especie, region = 'TODAS') {
    try {
      const df_desembarque = dataStore.getDesembarques();
      const df_produccion = dataStore.getMateriaPrimaProduccion();

      if (!df_desembarque || !df_produccion || df_desembarque.length === 0 || df_produccion.length === 0) {
        return {
          success: false,
          error: 'Datasets no disponibles'
        };
      }

      const especieNorm = normalizarTexto(especie);

      // Filtrar desembarques por especie (y región si aplica)
      let desembarques = df_desembarque.filter(row =>
        normalizarTexto(row.especie) === especieNorm
      );

      if (region !== 'TODAS') {
        const regionNorm = normalizarRegion(region);
        desembarques = desembarques.filter(row =>
          normalizarRegion(row.region) === regionNorm
        );
      }

      // Filtrar producción por especie (y región si aplica)
      let produccion = df_produccion.filter(row =>
        normalizarTexto(row.especie) === especieNorm
      );

      if (region !== 'TODAS') {
        const regionNorm = normalizarRegion(region);
        produccion = produccion.filter(row =>
          normalizarRegion(row.region) === regionNorm
        );
      }

      // Agrupar por año - Desembarques
      const desembarquesPorAnio = {};
      desembarques.forEach(row => {
        const anio = row.año;
        const toneladas = parseFloat(row.toneladas) || 0;
        desembarquesPorAnio[anio] = (desembarquesPorAnio[anio] || 0) + toneladas;
      });

      // Agrupar por año - Materia Prima
      const materiaPrimaPorAnio = {};
      produccion.forEach(row => {
        const anio = row.año;
        const toneladas = parseFloat(row.toneladas_mp) || 0;
        materiaPrimaPorAnio[anio] = (materiaPrimaPorAnio[anio] || 0) + toneladas;
      });

      // ========================================
      // OUTER JOIN: Incluye TODOS los años (2010-2024)
      // Rellena con 0 los años sin datos (especies no procesadas)
      // ========================================
      const anios = [];
      for (let anio = 2000; anio <= 2024; anio++) {
        anios.push(anio);
      }

      const data = anios.map(anio => ({
        año: anio,
        desembarque: Math.round(desembarquesPorAnio[anio] || 0),    // ✅ 0 si no hay captura
        materiaPrima: Math.round(materiaPrimaPorAnio[anio] || 0),   // ✅ 0 si no hay procesamiento
        brecha: Math.round((desembarquesPorAnio[anio] || 0) - (materiaPrimaPorAnio[anio] || 0))
      }));

      // Calcular estadísticas
      const totalDesembarque = data.reduce((sum, item) => sum + item.desembarque, 0);
      const totalMateriaPrima = data.reduce((sum, item) => sum + item.materiaPrima, 0);
      const porcentajeProcesado = totalDesembarque > 0
        ? (totalMateriaPrima / totalDesembarque) * 100
        : 0;

      return {
        success: true,
        especie: especieNorm,
        region,
        data,
        estadisticas: {
          totalDesembarque: Math.round(totalDesembarque),
          totalMateriaPrima: Math.round(totalMateriaPrima),
          totalBrecha: Math.round(totalDesembarque - totalMateriaPrima),
          porcentajeProcesado: parseFloat(porcentajeProcesado.toFixed(1)),
          porcentajeOtrosDestinos: parseFloat((100 - porcentajeProcesado).toFixed(1))
        }
      };

    } catch (error) {
      console.error('Error en obtenerTrazabilidad:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene la matriz de destino para una especie
   * Calcula qué porcentaje va a procesamiento industrial vs otros destinos
   */
  static obtenerMatrizDestino(especie, region = 'TODAS') {
    try {
      const trazabilidad = this.obtenerTrazabilidad(especie, region);

      if (!trazabilidad.success) {
        return trazabilidad;
      }

      const { estadisticas } = trazabilidad;

      // Datos para gráfico de barras apiladas 100%
      const data = [
        {
          categoria: 'Destino de Captura',
          industrial: estadisticas.porcentajeProcesado,
          otros: estadisticas.porcentajeOtrosDestinos
        }
      ];

      // Datos para gráfico de tipo Sankey o Donut
      const destinos = [
        {
          name: 'Procesamiento Industrial',
          value: estadisticas.totalMateriaPrima,
          porcentaje: estadisticas.porcentajeProcesado
        },
        {
          name: 'Otros Destinos',
          value: estadisticas.totalBrecha,
          porcentaje: estadisticas.porcentajeOtrosDestinos,
          detalle: 'Consumo fresco, exportación directa, harina artesanal'
        }
      ];

      return {
        success: true,
        especie,
        region,
        data,
        destinos,
        estadisticas
      };

    } catch (error) {
      console.error('Error en obtenerMatrizDestino:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene la evolución del destino industrial por línea de elaboración
   * Para gráfico de áreas apiladas (Stacked Area Chart)
   */
  static obtenerEvolucionDestinoIndustrial(especie, region = 'TODAS') {
    try {
      const df_produccion = dataStore.getMateriaPrimaProduccion();

      if (!df_produccion || df_produccion.length === 0) {
        return {
          success: false,
          error: 'Dataset de producción no disponible'
        };
      }

      const especieNorm = normalizarTexto(especie);

      // Filtrar producción por especie (y región si aplica)
      let produccion = df_produccion.filter(row =>
        normalizarTexto(row.especie) === especieNorm
      );

      if (region !== 'TODAS') {
        const regionNorm = normalizarRegion(region);
        produccion = produccion.filter(row =>
          normalizarRegion(row.region) === regionNorm
        );
      }

      if (produccion.length === 0) {
        return {
          success: false,
          error: 'No hay datos de producción para esta especie y región'
        };
      }

      // Agrupar por Año y Línea de Elaboración
      const agrupado = {};

      produccion.forEach(row => {
        const anio = row.año;
        const linea = normalizarTexto(row.linea_elaboracion || row.tipo_elaboracion || 'OTROS');
        // Usar toneladas_mp (materia prima) en lugar de produccion
        const produccionTon = parseFloat(row.toneladas_mp) || 0;

        if (!agrupado[anio]) {
          agrupado[anio] = {};
        }

        agrupado[anio][linea] = (agrupado[anio][linea] || 0) + produccionTon;
      });

      // Obtener todas las líneas únicas
      const lineasSet = new Set();
      Object.values(agrupado).forEach(anioDatos => {
        Object.keys(anioDatos).forEach(linea => lineasSet.add(linea));
      });

      const lineas = Array.from(lineasSet).sort();

      // Crear serie temporal (2000-2024) con todas las líneas
      const data = [];
      for (let anio = 2000; anio <= 2024; anio++) {
        const punto = { año: anio };

        lineas.forEach(linea => {
          punto[linea] = Math.round(agrupado[anio]?.[linea] || 0);
        });

        data.push(punto);
      }

      // Calcular totales por línea para estadísticas
      const totalesPorLinea = {};
      lineas.forEach(linea => {
        totalesPorLinea[linea] = data.reduce((sum, item) => sum + (item[linea] || 0), 0);
      });

      const totalGeneral = Object.values(totalesPorLinea).reduce((sum, val) => sum + val, 0);

      return {
        success: true,
        especie: especieNorm,
        region,
        data,
        lineas,
        estadisticas: {
          totalProduccion: Math.round(totalGeneral),
          porLinea: Object.entries(totalesPorLinea).map(([linea, total]) => ({
            linea,
            total: Math.round(total),
            porcentaje: totalGeneral > 0 ? parseFloat(((total / totalGeneral) * 100).toFixed(1)) : 0
          })).sort((a, b) => b.total - a.total)
        }
      };

    } catch (error) {
      console.error('Error en obtenerEvolucionDestinoIndustrial:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene comparación regional de captura vs procesamiento
   * Para gráfico de barras agrupadas (Grouped Bar Chart)
   * @param {string} especie - Nombre de la especie
   * @param {string|number} year - Año específico o "TODOS" para acumulado
   */
  /**
   * Obtiene comparación regional: Captura vs Procesamiento por región
   * Para gráfico de barras horizontales (RegionalBalanceChart)
   * @param {string} especie - Especie a analizar
   * @param {string|number} year - Año a filtrar (default 'TODOS')
   * @param {string} region - Región a filtrar (default 'TODAS')
   */
  static obtenerComparacionRegional(especie, year = 'TODOS', region = 'TODAS') {
    try {
      const df_desembarque = dataStore.getDesembarques();
      const df_produccion = dataStore.getMateriaPrimaProduccion();

      if (!df_desembarque || !df_produccion || df_desembarque.length === 0 || df_produccion.length === 0) {
        return {
          success: false,
          error: 'Datasets no disponibles'
        };
      }

      const especieNorm = normalizarTexto(especie);
      const yearStr = year.toString().toUpperCase();
      const isYearFilter = yearStr !== 'TODOS' && yearStr !== '' && !isNaN(parseInt(year));
      const regionStr = region.toString().toUpperCase();
      const isRegionFilter = regionStr !== 'TODAS' && regionStr !== '';

      console.log(`🔍 [ComparacionRegional] Filtros: especie=${especie}, year=${year}, region=${region}`);

      // ========================================
      // FILTRADO SECUENCIAL: especie → año → región
      // ========================================

      // Filtrar desembarques por especie
      let desembarques = df_desembarque.filter(row =>
        normalizarTexto(row.especie) === especieNorm
      );

      // Filtrar por año si aplica
      if (isYearFilter) {
        desembarques = desembarques.filter(row => {
          const rowYear = parseInt(row.año || row.anio || row.ano || row.year);
          return rowYear === parseInt(year);
        });
        console.log(`📊 [ComparacionRegional] Desembarques filtrados por año ${year}: ${desembarques.length} registros`);
      }

      // ✅ FILTRAR POR REGIÓN ANTES DEL GROUPBY (Backend Filtering)
      if (isRegionFilter) {
        const regionNorm = normalizarRegion(region);
        desembarques = desembarques.filter(row =>
          normalizarRegion(row.region) === regionNorm
        );
        console.log(`📊 [ComparacionRegional] Desembarques filtrados por región ${region}: ${desembarques.length} registros`);
      }

      // Filtrar producción por especie
      let produccion = df_produccion.filter(row =>
        normalizarTexto(row.especie) === especieNorm
      );

      // Filtrar por año si aplica
      if (isYearFilter) {
        produccion = produccion.filter(row => {
          const rowYear = parseInt(row.año || row.anio || row.ano || row.year);
          return rowYear === parseInt(year);
        });
        console.log(`📊 [ComparacionRegional] Producción filtrada por año ${year}: ${produccion.length} registros`);
      }

      // ✅ FILTRAR POR REGIÓN ANTES DEL GROUPBY (Backend Filtering)
      if (isRegionFilter) {
        const regionNorm = normalizarRegion(region);
        produccion = produccion.filter(row =>
          normalizarRegion(row.region) === regionNorm
        );
        console.log(`📊 [ComparacionRegional] Producción filtrada por región ${region}: ${produccion.length} registros`);
      }

      if (desembarques.length === 0 && produccion.length === 0) {
        return {
          success: false,
          error: isYearFilter
            ? `No hay datos para esta especie en el año ${year}`
            : 'No hay datos para esta especie'
        };
      }

      // Agrupar desembarques por región
      const capturaPorRegion = {};
      desembarques.forEach(row => {
        const region = normalizarRegion(row.region);
        const toneladas = parseFloat(row.toneladas) || 0;
        capturaPorRegion[region] = (capturaPorRegion[region] || 0) + toneladas;
      });

      // Agrupar producción por región
      const procesamientoPorRegion = {};
      produccion.forEach(row => {
        const region = normalizarRegion(row.region);
        const toneladas = parseFloat(row.toneladas_mp) || 0;
        procesamientoPorRegion[region] = (procesamientoPorRegion[region] || 0) + toneladas;
      });

      // Obtener todas las regiones únicas
      const regionesSet = new Set([
        ...Object.keys(capturaPorRegion),
        ...Object.keys(procesamientoPorRegion)
      ]);

      // Mapeo de nombres cortos
      const nombresCortos = {
        'LAGOS': 'Los Lagos',
        'AYSEN': 'Aysén',
        'MAGALLANES': 'Magallanes'
      };

      // Crear datos para el gráfico - ORDENADO POR CAPTURA (mayor a menor)
      const data = Array.from(regionesSet).map(region => ({
        region: nombresCortos[region] || region,
        captura: Math.round(capturaPorRegion[region] || 0),
        procesamiento: Math.round(procesamientoPorRegion[region] || 0)
      })).sort((a, b) => b.captura - a.captura); // Siempre ordenado por captura descendente

      // Calcular totales
      const totalCaptura = data.reduce((sum, item) => sum + item.captura, 0);
      const totalProcesamiento = data.reduce((sum, item) => sum + item.procesamiento, 0);

      return {
        success: true,
        especie: especieNorm,
        year: isYearFilter ? parseInt(year) : 'TODOS',
        yearLabel: isYearFilter ? year.toString() : '2010-2024',
        data,
        estadisticas: {
          totalCaptura: Math.round(totalCaptura),
          totalProcesamiento: Math.round(totalProcesamiento),
          porcentajeProcesado: totalCaptura > 0
            ? parseFloat(((totalProcesamiento / totalCaptura) * 100).toFixed(1))
            : 0,
          regionConMayorCaptura: data.length > 0 ? data[0].region : null,
          regionConMayorProcesamiento: data.length > 0
            ? data.sort((a, b) => b.procesamiento - a.procesamiento)[0].region
            : null
        }
      };

    } catch (error) {
      console.error('Error en obtenerComparacionRegional:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene comparación Year-over-Year (YoY) entre dos años específicos
   * @param {string} especie - Especie a analizar
   * @param {string|number} yearA - Primer año (año base)
   * @param {string|number} yearB - Segundo año (año comparación)
   * @param {string} region - Región a filtrar (default 'TODAS')
   */
  static obtenerComparacionYoY(especie, yearA, yearB, region = 'TODAS') {
    try {
      const df_desembarque = dataStore.getDesembarques();
      const df_produccion = dataStore.getMateriaPrimaProduccion();

      if (!df_desembarque || !df_produccion || df_desembarque.length === 0 || df_produccion.length === 0) {
        return {
          success: false,
          error: 'Datasets no disponibles'
        };
      }

      const especieNorm = normalizarTexto(especie);
      const regionStr = region.toString().toUpperCase();
      const isRegionFilter = regionStr !== 'TODAS' && regionStr !== '';

      console.log(`📊 [YoY] Comparando ${especie}: ${yearA} vs ${yearB}, región=${region}`);

      // ========================================
      // FUNCIÓN AUXILIAR: Calcular totales por año
      // ========================================
      const calcularTotalesPorAno = (year) => {
        // Filtrar desembarques
        let desembarques = df_desembarque.filter(row =>
          normalizarTexto(row.especie) === especieNorm &&
          parseInt(row.año || row.anio || row.ano || row.year) === parseInt(year)
        );

        if (isRegionFilter) {
          const regionNorm = normalizarRegion(region);
          desembarques = desembarques.filter(row =>
            normalizarRegion(row.region) === regionNorm
          );
        }

        // Filtrar producción
        let produccion = df_produccion.filter(row =>
          normalizarTexto(row.especie) === especieNorm &&
          parseInt(row.año || row.anio || row.ano || row.year) === parseInt(year)
        );

        if (isRegionFilter) {
          const regionNorm = normalizarRegion(region);
          produccion = produccion.filter(row =>
            normalizarRegion(row.region) === regionNorm
          );
        }

        // Calcular totales
        const totalCaptura = desembarques.reduce((sum, row) =>
          sum + (parseFloat(row.toneladas) || 0), 0
        );

        const totalProcesamiento = produccion.reduce((sum, row) =>
          sum + (parseFloat(row.toneladas_mp) || 0), 0
        );

        return {
          captura: totalCaptura,
          procesamiento: totalProcesamiento
        };
      };

      // ========================================
      // CALCULAR DATOS PARA AMBOS AÑOS
      // ========================================
      const dataYearA = calcularTotalesPorAno(yearA);
      const dataYearB = calcularTotalesPorAno(yearB);

      console.log(`📊 [YoY] Año ${yearA}: Captura=${dataYearA.captura.toFixed(0)} ton, Procesamiento=${dataYearA.procesamiento.toFixed(0)} ton`);
      console.log(`📊 [YoY] Año ${yearB}: Captura=${dataYearB.captura.toFixed(0)} ton, Procesamiento=${dataYearB.procesamiento.toFixed(0)} ton`);

      // ========================================
      // CALCULAR VARIACIONES
      // ========================================
      const calcularVariacion = (valorA, valorB) => {
        if (valorA === 0) return valorB > 0 ? 100 : 0;
        return ((valorB - valorA) / valorA) * 100;
      };

      const variacionCaptura = calcularVariacion(dataYearA.captura, dataYearB.captura);
      const variacionProcesamiento = calcularVariacion(dataYearA.procesamiento, dataYearB.procesamiento);

      return {
        success: true,
        especie: especieNorm,
        yearA: parseInt(yearA),
        yearB: parseInt(yearB),
        region: region,
        dataYearA: {
          captura: dataYearA.captura,
          procesamiento: dataYearA.procesamiento
        },
        dataYearB: {
          captura: dataYearB.captura,
          procesamiento: dataYearB.procesamiento
        },
        variaciones: {
          captura: parseFloat(variacionCaptura.toFixed(1)),
          procesamiento: parseFloat(variacionProcesamiento.toFixed(1))
        }
      };

    } catch (error) {
      console.error('Error en obtenerComparacionYoY:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene matriz de estacionalidad (Mapa de Calor)
   * Filas: Años (descendente)
   * Columnas: Meses (1-12)
   * Valores: Toneladas capturadas
   * 
   * @param {string} especie - Especie a analizar
   * @param {string} region - Región filtrada
   * @returns {Object} Matriz de estacionalidad con años y meses completos
   */
  static obtenerMatrizEstacionalidad(especie, region) {
    try {
      const especieNorm = normalizarTexto(especie);

      // Verificar si la región es TODAS ANTES de normalizar
      const regionOriginal = String(region || '').trim().toUpperCase();
      const esTodasRegiones = regionOriginal === 'TODAS' || regionOriginal === '';
      const regionNorm = esTodasRegiones ? 'TODAS' : normalizarRegion(region);

      const df_desembarque = dataStore.getDesembarques();

      if (!df_desembarque || df_desembarque.length === 0) {
        return {
          success: false,
          error: 'Dataset de desembarques no disponible',
          data: []
        };
      }

      console.log(`🔍 [Estacionalidad] Filtros: especie=${especie}, region=${region} → regionNorm=${regionNorm}, esTodasRegiones=${esTodasRegiones}`);

      // Filtrar datos por especie y región
      let debugCount = 0;
      const registrosFiltrados = df_desembarque.filter(row => {
        const especieMatch = normalizarTexto(row.especie) === especieNorm;

        // Normalizar la región de la fila del CSV para comparar manzanas con manzanas
        const regionFilaNormalizada = normalizarRegion(row.region || row.Region || row.REGION || '');

        // Si la región solicitada es TODAS, aceptar cualquier región
        const regionMatch = esTodasRegiones
          ? true
          : regionFilaNormalizada === regionNorm;

        // Debug log para los primeros 5 registros que coinciden con la especie
        if (especieMatch && debugCount < 5) {
          console.log(`🔎 [Debug] Comparando:`, {
            csv_original: row.region || row.Region || row.REGION,
            csv_normalizada: regionFilaNormalizada,
            buscada: regionNorm,
            match: regionMatch,
            especie: row.especie,
            año: row.año,
            ano: row.ano,
            mes: row.mes,
            ton: row.toneladas
          });
          debugCount++;
        }

        // El objeto normalizado usa 'año' con ñ, no 'ano'
        return especieMatch && regionMatch && row.año && row.mes && row.toneladas;
      });

      console.log(`📊 [Estacionalidad] Registros filtrados: ${registrosFiltrados.length}`);

      if (registrosFiltrados.length === 0) {
        return {
          success: true,
          data: [],
          maxValue: 0
        };
      }

      // Agrupar por Año y Mes, sumando toneladas
      const agrupado = {};

      registrosFiltrados.forEach(row => {
        const year = parseInt(row.año); // Usar 'año' con ñ
        const month = parseInt(row.mes);
        const toneladas = parseFloat(row.toneladas) || 0;

        if (!agrupado[year]) {
          agrupado[year] = {};
        }
        if (!agrupado[year][month]) {
          agrupado[year][month] = 0;
        }
        agrupado[year][month] += toneladas;
      });

      // Obtener rango de años (2000-2024)
      const years = [];
      for (let y = 2024; y >= 2000; y--) {
        years.push(y);
      }

      // Nombres de meses en español (orden 1-12)
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      // Construir matriz completa con relleno de ceros
      const matrizCompleta = years.map(year => {
        const months = [];
        for (let m = 1; m <= 12; m++) {
          months.push({
            month: m,
            monthName: monthNames[m - 1],
            value: agrupado[year]?.[m] || 0 // Relleno con 0 si no hay dato
          });
        }
        return {
          year: year,
          months: months
        };
      });

      // Calcular maxValue para la escala de color
      let maxValue = 0;
      matrizCompleta.forEach(yearData => {
        yearData.months.forEach(monthData => {
          if (monthData.value > maxValue) {
            maxValue = monthData.value;
          }
        });
      });

      console.log(`📈 [Estacionalidad] Años: ${years.length}, MaxValue: ${maxValue.toFixed(2)} ton`);

      return {
        success: true,
        data: matrizCompleta,
        maxValue: parseFloat(maxValue.toFixed(2)),
        years: years,
        especie: especie,
        region: region
      };

    } catch (error) {
      console.error('Error en obtenerMatrizEstacionalidad:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

module.exports = ComparadorService;
