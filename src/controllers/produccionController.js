const dataStore = require('../data/dataStore');

/**
 * Controlador para el Dashboard de Producción
 * Maneja endpoints específicos para visualización de materia prima y producción
 */
class ProduccionController {
  
  /**
   * Obtiene estadísticas generales de producción (KPIs)
   * GET /api/v1/produccion/estadisticas
   */
  static getEstadisticas(req, res) {
    try {
      const { region, anio, especie, linea_elaboracion } = req.query;
      
      // Obtener todos los datos de producción
      let datos = dataStore.getMateriaPrimaProduccion();
      
      console.log(`📊 Total de registros de producción: ${datos.length}`);
      
      // Aplicar filtros si existen
      if (region && region !== 'null' && region !== 'undefined') {
        datos = datos.filter(d => d.region && d.region.toLowerCase() === region.toLowerCase());
      }
      
      if (anio && anio !== 'null' && anio !== 'undefined') {
        const añoNum = parseInt(anio);
        datos = datos.filter(d => d.año === añoNum);
      }
      
      if (especie && especie !== 'null' && especie !== 'undefined') {
        datos = datos.filter(d => d.especie && d.especie.toLowerCase().includes(especie.toLowerCase()));
      }
      
      if (linea_elaboracion && linea_elaboracion !== 'null' && linea_elaboracion !== 'undefined') {
        datos = datos.filter(d => d.tipo_elaboracion && d.tipo_elaboracion.toLowerCase().includes(linea_elaboracion.toLowerCase()));
      }
      
      console.log(`📊 Registros después de filtros: ${datos.length}`);
      
      // Calcular estadísticas
      const totalMateriaPrima = datos.reduce((sum, d) => sum + (parseFloat(d.toneladas_mp) || 0), 0);
      const totalProduccion = datos.reduce((sum, d) => sum + (parseFloat(d.toneladas_elaboradas) || 0), 0);
      
      // Contar especies únicas
      const especiesUnicas = new Set(datos.map(d => d.especie).filter(Boolean));
      
      // Calcular rendimiento promedio
      const rendimientoPromedio = totalMateriaPrima > 0 
        ? (totalProduccion / totalMateriaPrima) * 100 
        : 0;
      
      console.log('📈 Estadísticas calculadas:', {
        totalMateriaPrima,
        totalProduccion,
        especiesUnicas: especiesUnicas.size,
        rendimientoPromedio
      });
      
      res.json({
        success: true,
        estadisticas: {
          totalMateriaPrima: Math.round(totalMateriaPrima * 10) / 10,
          totalProduccion: Math.round(totalProduccion * 10) / 10,
          especiesUnicas: especiesUnicas.size,
          rendimientoPromedio: Math.round(rendimientoPromedio * 10) / 10,
          registros: datos.length
        }
      });
      
    } catch (error) {
      console.error('❌ Error en getEstadisticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de producción',
        message: error.message
      });
    }
  }
  
  /**
   * Obtiene datos para el gráfico de Balance de Masas
   * GET /api/v1/produccion/balance-masas
   */
  static getBalanceMasas(req, res) {
    try {
      const { region, especie, linea_elaboracion } = req.query;
      
      let datos = dataStore.getMateriaPrimaProduccion();
      
      // Aplicar filtros
      if (region && region !== 'null' && region !== 'undefined') {
        datos = datos.filter(d => d.region && d.region.toLowerCase() === region.toLowerCase());
      }
      
      if (especie && especie !== 'null' && especie !== 'undefined') {
        datos = datos.filter(d => d.especie && d.especie.toLowerCase().includes(especie.toLowerCase()));
      }
      
      if (linea_elaboracion && linea_elaboracion !== 'null' && linea_elaboracion !== 'undefined') {
        datos = datos.filter(d => d.tipo_elaboracion && d.tipo_elaboracion.toLowerCase().includes(linea_elaboracion.toLowerCase()));
      }
      
      // Agrupar por año
      const porAnio = {};
      
      datos.forEach(d => {
        const año = d.año;
        if (!año) return;
        
        if (!porAnio[año]) {
          porAnio[año] = {
            año: año,
            materiaPrima: 0,
            produccion: 0
          };
        }
        
        porAnio[año].materiaPrima += parseFloat(d.toneladas_mp) || 0;
        porAnio[año].produccion += parseFloat(d.toneladas_elaboradas) || 0;
      });
      
      // Convertir a array y ordenar por año
      const data = Object.values(porAnio)
        .sort((a, b) => a.año - b.año)
        .map(item => ({
          año: item.año,
          materiaPrima: Math.round(item.materiaPrima * 10) / 10,
          produccion: Math.round(item.produccion * 10) / 10
        }));
      
      console.log(`📊 Balance de Masas: ${data.length} años procesados`);
      
      res.json({
        success: true,
        data: data
      });
      
    } catch (error) {
      console.error('❌ Error en getBalanceMasas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener balance de masas',
        message: error.message
      });
    }
  }
  
  /**
   * Obtiene datos para el gráfico de Perfil Industrial (DonutChart)
   * GET /api/v1/produccion/perfil-industrial
   */
  static getPerfilIndustrial(req, res) {
    try {
      const { region, anio, especie } = req.query;
      
      let datos = dataStore.getMateriaPrimaProduccion();
      
      // Aplicar filtros
      if (region && region !== 'null' && region !== 'undefined') {
        datos = datos.filter(d => d.region && d.region.toLowerCase() === region.toLowerCase());
      }
      
      if (anio && anio !== 'null' && anio !== 'undefined') {
        const añoNum = parseInt(anio);
        datos = datos.filter(d => d.año === añoNum);
      }
      
      if (especie && especie !== 'null' && especie !== 'undefined') {
        datos = datos.filter(d => d.especie && d.especie.toLowerCase().includes(especie.toLowerCase()));
      }
      
      // Agrupar por línea de elaboración
      const porLinea = {};
      
      datos.forEach(d => {
        const linea = d.tipo_elaboracion || 'Sin especificar';
        
        if (!porLinea[linea]) {
          porLinea[linea] = {
            name: linea,
            value: 0
          };
        }
        
        porLinea[linea].value += parseFloat(d.toneladas_elaboradas) || 0;
      });
      
      // Convertir a array y ordenar por valor descendente
      const data = Object.values(porLinea)
        .map(item => ({
          name: item.name,
          value: Math.round(item.value * 10) / 10
        }))
        .sort((a, b) => b.value - a.value);
      
      console.log(`📊 Perfil Industrial: ${data.length} líneas de elaboración`);
      
      res.json({
        success: true,
        data: data
      });
      
    } catch (error) {
      console.error('❌ Error en getPerfilIndustrial:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener perfil industrial',
        message: error.message
      });
    }
  }
  
  /**
   * Obtiene opciones disponibles para filtros de producción
   * GET /api/v1/produccion/opciones
   */
  static getOpciones(req, res) {
    try {
      const datos = dataStore.getMateriaPrimaProduccion();
      
      const años = new Set();
      const especies = new Set();
      const lineasElaboracion = new Set();
      const regiones = new Set();
      
      datos.forEach(d => {
        if (d.año) años.add(d.año);
        if (d.especie) especies.add(d.especie);
        if (d.tipo_elaboracion) lineasElaboracion.add(d.tipo_elaboracion);
        if (d.region) regiones.add(d.region);
      });
      
      res.json({
        success: true,
        opciones: {
          años: Array.from(años).sort((a, b) => b - a),
          especies: Array.from(especies).sort(),
          lineasElaboracion: Array.from(lineasElaboracion).sort(),
          regiones: Array.from(regiones).sort()
        }
      });
      
    } catch (error) {
      console.error('❌ Error en getOpciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener opciones disponibles',
        message: error.message
      });
    }
  }
}

module.exports = ProduccionController;
