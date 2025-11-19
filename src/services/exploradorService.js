const dataStore = require('../data/dataStore');
const { 
  normalizarTexto, 
  normalizarRegion,
  parsearDecimal,
  parsearEntero,
  filtrarDatos
} = require('../utils/normalizar');

/**
 * Servicio para exploración dinámica de datos
 */
class ExploradorService {
  /**
   * Obtiene el dataset según el tipo solicitado
   * @param {string} tipoDato - Tipo de dato (cosecha, produccion, plantas)
   * @returns {Array} Dataset solicitado
   */
  static obtenerDataset(tipoDato) {
    switch (normalizarTexto(tipoDato)) {
      case 'COSECHA':
      case 'COSECHAS':
      case 'DESEMBARQUE':
      case 'DESEMBARQUES':
        return dataStore.getDesembarques();
      
      case 'PRODUCCION':
      case 'PRODUCCIÓN':
      case 'MATERIA':
      case 'MATERIA_PRIMA':
        return dataStore.getMateriaPrimaProduccion();
      
      case 'PLANTA':
      case 'PLANTAS':
      case 'INFRAESTRUCTURA':
        return dataStore.getPlantas();
      
      default:
        return [];
    }
  }

  /**
   * Normaliza los filtros recibidos
   * @param {Object} filtros - Filtros crudos
   * @returns {Object} Filtros normalizados
   */
  static normalizarFiltros(filtros) {
    const normalizados = {};

    if (filtros.region) {
      normalizados.region = normalizarRegion(filtros.region);
    }

    if (filtros.anio || filtros.año) {
      const año = parsearEntero(filtros.anio || filtros.año);
      if (año > 0) normalizados.año = año;
    }

    if (filtros.mes) {
      const mes = parsearEntero(filtros.mes);
      if (mes >= 1 && mes <= 12) normalizados.mes = mes;
    }

    if (filtros.especie) {
      normalizados.especie = normalizarTexto(filtros.especie);
    }

    if (filtros.tipo_elaboracion) {
      normalizados.tipo_elaboracion = normalizarTexto(filtros.tipo_elaboracion);
    }

    if (filtros.cd_planta) {
      normalizados.cd_planta = parsearEntero(filtros.cd_planta);
    }

    return normalizados;
  }

  /**
   * Aplica filtros regionales adicionales
   * @param {Array} datos - Dataset a filtrar
   * @param {string} region - Región a filtrar
   * @returns {Array} Datos filtrados
   */
  static filtrarPorRegion(datos, region) {
    if (!region || region === 'TODAS') {
      return datos;
    }

    const regionNormalizada = normalizarRegion(region);
    
    return datos.filter(item => {
      const regionItem = normalizarRegion(item.region || item.REGION || '');
      return regionItem === regionNormalizada;
    });
  }

  /**
   * Calcula estadísticas básicas de un dataset
   * @param {Array} datos - Dataset
   * @param {string} tipoDato - Tipo de dato
   * @returns {Object} Estadísticas
   */
  static calcularEstadisticas(datos, tipoDato) {
    const stats = {
      totalRegistros: datos.length,
      añosUnicos: new Set(),
      regionesUnicas: new Set(),
      especiesUnicas: new Set()
    };

    datos.forEach(item => {
      if (item.año || item.AÑO) {
        stats.añosUnicos.add(item.año || item.AÑO);
      }
      
      if (item.region || item.REGION) {
        const region = normalizarRegion(item.region || item.REGION);
        stats.regionesUnicas.add(region);
      }
      
      if (item.especie || item.ESPECIE) {
        stats.especiesUnicas.add(normalizarTexto(item.especie || item.ESPECIE));
      }
    });

    // Calcular totales según tipo de dato
    if (tipoDato === 'COSECHA' || tipoDato === 'DESEMBARQUE') {
      stats.toneladasTotales = datos.reduce((sum, item) => 
        sum + parsearDecimal(item.toneladas || 0), 0
      );
    } else if (tipoDato === 'PRODUCCION') {
      stats.toneladasMPTotales = datos.reduce((sum, item) => 
        sum + parsearDecimal(item.toneladas_mp || 0), 0
      );
      stats.toneladasElaboradasTotales = datos.reduce((sum, item) => 
        sum + parsearDecimal(item.toneladas_elaboradas || 0), 0
      );
    } else if (tipoDato === 'PLANTAS') {
      const plantasUnicas = new Set();
      datos.forEach(item => {
        if (item.cd_planta) plantasUnicas.add(item.cd_planta);
      });
      stats.plantasUnicas = plantasUnicas.size;
    }

    return {
      totalRegistros: stats.totalRegistros,
      añosUnicos: stats.añosUnicos.size,
      regionesUnicas: stats.regionesUnicas.size,
      especiesUnicas: stats.especiesUnicas.size,
      toneladasTotales: Math.round((stats.toneladasTotales || 0) * 100) / 100,
      toneladasMPTotales: Math.round((stats.toneladasMPTotales || 0) * 100) / 100,
      toneladasElaboradasTotales: Math.round((stats.toneladasElaboradasTotales || 0) * 100) / 100,
      plantasUnicas: stats.plantasUnicas || 0
    };
  }

  /**
   * Agrupa datos para visualización
   * @param {Array} datos - Datos filtrados
   * @param {string} tipoDato - Tipo de dato
   * @returns {Object} Datos agrupados para gráficos
   */
  static agruparDatosParaGraficos(datos, tipoDato) {
    const tipoNormalizado = normalizarTexto(tipoDato);
    
    // Agrupar por mes
    const porMes = new Map();
    
    // Agrupar por especie
    const porEspecie = new Map();
    
    datos.forEach(item => {
      const mes = item.mes || item.MES || 0;
      const especie = normalizarTexto(item.especie || item.ESPECIE || 'SIN ESPECIE');
      
      let toneladas = 0;
      
      if (tipoNormalizado.includes('COSECHA') || tipoNormalizado.includes('DESEMBARQUE')) {
        toneladas = parsearDecimal(item.toneladas || 0);
      } else if (tipoNormalizado.includes('PRODUCCION')) {
        // Para producción, usar materia prima como métrica principal
        toneladas = parsearDecimal(item.toneladas_mp || 0);
      }
      
      // Agrupar por mes
      if (mes > 0) {
        porMes.set(mes, (porMes.get(mes) || 0) + toneladas);
      }
      
      // Agrupar por especie
      if (especie && especie !== 'SIN ESPECIE') {
        porEspecie.set(especie, (porEspecie.get(especie) || 0) + toneladas);
      }
    });
    
    return {
      porMes: Array.from(porMes.entries())
        .map(([mes, toneladas]) => ({ mes, toneladas: Math.round(toneladas * 100) / 100 }))
        .sort((a, b) => a.mes - b.mes),
      
      porEspecie: Array.from(porEspecie.entries())
        .map(([especie, toneladas]) => ({ especie, toneladas: Math.round(toneladas * 100) / 100 }))
        .sort((a, b) => b.toneladas - a.toneladas)
        .slice(0, 10)
    };
  }

  /**
   * Explora datos dinámicamente según tipo y filtros
   * @param {string} tipoDato - Tipo de dato (cosecha, produccion, plantas)
   * @param {Object} filtros - Filtros adicionales
   * @returns {Object} Datos explorados con estadísticas y gráficos
   */
  static explorarDatos(tipoDato, filtros = {}) {
    try {
      const tipoNormalizado = normalizarTexto(tipoDato);
      
      if (!tipoNormalizado) {
        return {
          success: false,
          message: 'Debe especificar el tipo de dato (cosecha, produccion o plantas)'
        };
      }

      // Obtener dataset
      const dataset = this.obtenerDataset(tipoNormalizado);

      if (!dataset || dataset.length === 0) {
        return {
          success: false,
          message: `No hay datos disponibles para el tipo: ${tipoDato}`,
          tipo_dato: tipoDato,
          estadisticas: {},
          graficos: {}
        };
      }

      // Normalizar filtros
      const filtrosNormalizados = this.normalizarFiltros(filtros);

      // Aplicar filtros
      let datosFiltrados = dataset;

      // Filtro regional
      if (filtrosNormalizados.region) {
        datosFiltrados = this.filtrarPorRegion(datosFiltrados, filtrosNormalizados.region);
      }

      // Otros filtros usando la función filtrarDatos del módulo normalizar
      const otrosFiltros = { ...filtrosNormalizados };
      delete otrosFiltros.region;
      
      if (Object.keys(otrosFiltros).length > 0) {
        datosFiltrados = filtrarDatos(datosFiltrados, otrosFiltros);
      }

      if (datosFiltrados.length === 0) {
        return {
          success: true,
          message: 'No se encontraron datos con los filtros aplicados',
          tipo_dato: tipoDato,
          filtros: filtrosNormalizados,
          estadisticas: {
            totalRegistros: 0
          },
          graficos: {
            porMes: [],
            porEspecie: []
          }
        };
      }

      // Calcular estadísticas
      const estadisticas = this.calcularEstadisticas(datosFiltrados, tipoNormalizado);

      // Agrupar datos para gráficos
      const graficos = this.agruparDatosParaGraficos(datosFiltrados, tipoNormalizado);

      return {
        success: true,
        tipo_dato: tipoDato,
        filtros: filtrosNormalizados,
        estadisticas,
        graficos
      };

    } catch (error) {
      console.error('Error en explorarDatos:', error);
      return {
        success: false,
        error: error.message,
        tipo_dato: tipoDato
      };
    }
  }
}

module.exports = ExploradorService;
