const dataStore = require('../data/dataStore');
const { 
  normalizarTexto, 
  normalizarRegion,
  filtrarDatos,
  parsearDecimal
} = require('../utils/normalizar');

/**
 * Servicio para análisis general y comparativo de datos
 */
class GeneralService {
  /**
   * Filtra datos por región (con normalización)
   * @param {Array} datos - Array de datos
   * @param {string} regionFiltro - Región a filtrar (LAGOS, AYSEN, MAGALLANES o TODAS)
   * @returns {Array} Datos filtrados
   */
  static filtrarPorRegion(datos, regionFiltro) {
    if (!regionFiltro || regionFiltro === 'TODAS') {
      return datos;
    }
    
    const regionNormalizada = normalizarRegion(regionFiltro);
    
    return datos.filter(item => {
      const regionItem = normalizarRegion(item.region || item.REGION || '');
      return regionItem === regionNormalizada;
    });
  }

  /**
   * Calcula total de toneladas cosechadas
   * @param {Array} desembarques - Array de desembarques
   * @returns {number} Total de toneladas
   */
  static calcularTotalCosechado(desembarques) {
    return desembarques.reduce((sum, item) => {
      const toneladas = parsearDecimal(item.toneladas || 0);
      return sum + toneladas;
    }, 0);
  }

  /**
   * Calcula total de toneladas procesadas
   * @param {Array} produccion - Array de datos de producción
   * @returns {number} Total de toneladas procesadas
   */
  static calcularTotalProcesado(produccion) {
    return produccion.reduce((sum, item) => {
      const toneladas = parsearDecimal(item.toneladas_elaboradas || item.toneladas_mp || 0);
      return sum + toneladas;
    }, 0);
  }

  /**
   * Cuenta el número de plantas únicas
   * @param {Array} plantas - Array de datos de plantas
   * @returns {number} Número de plantas únicas
   */
  static contarPlantas(plantas) {
    const plantasUnicas = new Set();
    
    plantas.forEach(item => {
      const cdPlanta = item.cd_planta || item.CD_PLANTA;
      if (cdPlanta) {
        plantasUnicas.add(cdPlanta);
      }
    });
    
    return plantasUnicas.size;
  }

  /**
   * Extrae las principales especies de un dataset
   * @param {Array} datos - Array de datos (desembarques o producción)
   * @param {number} limite - Número de especies a retornar
   * @returns {Array} Array de {especie, toneladas}
   */
  static obtenerPrincipalesEspecies(datos, limite = 5) {
    const especiesMap = new Map();
    
    datos.forEach(item => {
      const especie = normalizarTexto(item.especie || item.ESPECIE || 'SIN ESPECIE');
      const toneladas = parsearDecimal(item.toneladas || item.toneladas_mp || item.toneladas_elaboradas || 0);
      
      if (especie && especie !== 'SIN ESPECIE') {
        especiesMap.set(
          especie,
          (especiesMap.get(especie) || 0) + toneladas
        );
      }
    });
    
    return Array.from(especiesMap.entries())
      .map(([especie, toneladas]) => ({
        especie,
        toneladas: Math.round(toneladas * 100) / 100
      }))
      .sort((a, b) => b.toneladas - a.toneladas)
      .slice(0, limite);
  }

  /**
   * Agrupa datos por año para comparativa
   * @param {Array} desembarques - Array de desembarques
   * @param {Array} plantas - Array de plantas
   * @returns {Array} Array de {año, cosechaTotal, capacidadPlantas}
   */
  static agruparPorAnio(desembarques, plantas) {
    const añosMap = new Map();
    
    // Agrupar desembarques por año
    desembarques.forEach(item => {
      const año = item.año || item.AÑO || 0;
      if (año > 0) {
        if (!añosMap.has(año)) {
          añosMap.set(año, { año, cosechaTotal: 0, capacidadPlantas: 0 });
        }
        const toneladas = parsearDecimal(item.toneladas || 0);
        añosMap.get(año).cosechaTotal += toneladas;
      }
    });
    
    // Contar plantas por año
    const plantasPorAño = new Map();
    plantas.forEach(item => {
      const año = item.año || item.AÑO || 0;
      const cdPlanta = item.cd_planta || item.CD_PLANTA;
      
      if (año > 0 && cdPlanta) {
        if (!plantasPorAño.has(año)) {
          plantasPorAño.set(año, new Set());
        }
        plantasPorAño.get(año).add(cdPlanta);
      }
    });
    
    // Combinar datos
    plantasPorAño.forEach((plantas, año) => {
      if (añosMap.has(año)) {
        añosMap.get(año).capacidadPlantas = plantas.size;
      }
    });
    
    return Array.from(añosMap.values())
      .sort((a, b) => a.año - b.año);
  }

  /**
   * Obtiene el panorama general de una región
   * @param {string} region - Región a consultar (LAGOS, AYSEN, MAGALLANES o TODAS)
   * @returns {Object} KPIs y datos para gráficos
   */
  static obtenerPanoramaRegional(region = 'TODAS') {
    try {
      // Obtener datos
      const desembarques = dataStore.getDesembarques();
      const produccion = dataStore.getMateriaPrimaProduccion();
      const plantas = dataStore.getPlantas();

      if (!desembarques.length && !produccion.length && !plantas.length) {
        return {
          success: false,
          message: 'No hay datos disponibles',
          region: region,
          kpis: {
            totalCosechado: 0,
            totalProcesado: 0,
            numeroPlantas: 0
          },
          grafico_anual: [],
          principales_especies: []
        };
      }

      // Aplicar filtro regional
      const desembarquesFiltrados = this.filtrarPorRegion(desembarques, region);
      const produccionFiltrada = this.filtrarPorRegion(produccion, region);
      const plantasFiltradas = this.filtrarPorRegion(plantas, region);

      // Calcular KPIs
      const totalCosechado = this.calcularTotalCosechado(desembarquesFiltrados);
      const totalProcesado = this.calcularTotalProcesado(produccionFiltrada);
      const numeroPlantas = this.contarPlantas(plantasFiltradas);

      // Obtener principales especies
      const principales_especies = this.obtenerPrincipalesEspecies(desembarquesFiltrados, 5);

      // Agrupar por año para gráfico comparativo
      const grafico_anual = this.agruparPorAnio(desembarquesFiltrados, plantasFiltradas);

      return {
        success: true,
        region: region,
        kpis: {
          totalCosechado: Math.round(totalCosechado * 100) / 100,
          totalProcesado: Math.round(totalProcesado * 100) / 100,
          numeroPlantas
        },
        grafico_anual,
        principales_especies
      };

    } catch (error) {
      console.error('Error en obtenerPanoramaRegional:', error);
      return {
        success: false,
        error: error.message,
        region: region,
        kpis: {
          totalCosechado: 0,
          totalProcesado: 0,
          numeroPlantas: 0
        },
        grafico_anual: [],
        principales_especies: []
      };
    }
  }
}

module.exports = GeneralService;
