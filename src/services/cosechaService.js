const dataStore = require('../data/dataStore');
const { 
  normalizarTexto, 
  filtrarDatos, 
  parsearEntero,
  agruparYSumar,
  obtenerValoresUnicos
} = require('../utils/normalizar');

/**
 * Servicio para análisis de datos de cosechas
 */
class CosechaService {
  /**
   * Normaliza y valida los filtros recibidos
   * @param {Object} filters - Filtros de query string
   * @returns {Object} Filtros normalizados
   */
  static normalizeFilters(filters) {
    const normalized = {};

    // Normalizar año usando la función del módulo normalizar
    if (filters.anio) {
      const year = parsearEntero(filters.anio);
      normalized.anio = year > 0 ? year : null;
    }

    // Normalizar región usando la función del módulo normalizar
    if (filters.region) {
      normalized.region = normalizarTexto(filters.region);
    }

    // Normalizar especie usando la función del módulo normalizar
    if (filters.especie) {
      normalized.especie = normalizarTexto(filters.especie);
    }

    return normalized;
  }

  /**
   * Filtra los desembarques según los criterios proporcionados
   * Usa el módulo normalizar para aplicar filtros de manera consistente
   * @param {Array} desembarques - Array de desembarques
   * @param {Object} filters - Filtros normalizados
   * @returns {Array} Desembarques filtrados
   */
  static filterDesembarques(desembarques, filters) {
    // Usar la función filtrarDatos del módulo normalizar
    return filtrarDatos(desembarques, {
      año: filters.anio,
      region: filters.region,
      especie: filters.especie
    });
  }

  /**
   * Extrae el valor de toneladas de un registro
   * @param {Object} item - Registro de desembarque
   * @returns {number} Toneladas
   */
  static extractToneladas(item) {
    const toneladas = item.toneladas || item.TONELADAS || 
                      item.tonelada || item.TONELADA ||
                      item.ton || item.TON ||
                      item.peso || item.PESO || 0;
    
    return typeof toneladas === 'number' ? toneladas : parseFloat(toneladas) || 0;
  }

  /**
   * Extrae el mes de un registro
   * @param {Object} item - Registro de desembarque
   * @returns {string|number} Mes
   */
  static extractMes(item) {
    return item.mes || item.MES || item.month || item.MONTH || 'Sin mes';
  }

  /**
   * Extrae la especie de un registro
   * @param {Object} item - Registro de desembarque
   * @returns {string} Especie
   */
  static extractEspecie(item) {
    return normalizarTexto(item.especie || item.ESPECIE || 'SIN ESPECIE');
  }

  /**
   * Calcula KPIs y gráficos de cosechas
   * @param {Object} filters - Filtros para aplicar
   * @returns {Object} Objeto con KPIs y datos de gráficos
   */
  static calcularCosechas(filters = {}) {
    try {
      // Obtener datos de desembarques
      const desembarques = dataStore.getDesembarques();

      if (!desembarques || desembarques.length === 0) {
        return {
          success: false,
          message: 'No hay datos de desembarques disponibles',
          kpis: { cosechaTotal: 0, mesesConDatos: 0, especiesDetectadas: 0 },
          grafico_mensual: [],
          grafico_especies: []
        };
      }

      // Normalizar filtros
      const normalizedFilters = this.normalizeFilters(filters);

      // Filtrar datos
      const filteredData = this.filterDesembarques(desembarques, normalizedFilters);

      if (filteredData.length === 0) {
        return {
          success: true,
          message: 'No se encontraron datos con los filtros aplicados',
          filters: normalizedFilters,
          kpis: { cosechaTotal: 0, mesesConDatos: 0, especiesDetectadas: 0 },
          grafico_mensual: [],
          grafico_especies: []
        };
      }

      // Calcular KPIs
      const kpis = this.calcularKPIs(filteredData);

      // Calcular datos para gráfico mensual
      const grafico_mensual = this.calcularGraficoMensual(filteredData);

      // Calcular datos para gráfico de especies
      const grafico_especies = this.calcularGraficoEspecies(filteredData);

      return {
        success: true,
        filters: normalizedFilters,
        kpis,
        grafico_mensual,
        grafico_especies
      };

    } catch (error) {
      console.error('Error en calcularCosechas:', error);
      return {
        success: false,
        error: error.message,
        kpis: { cosechaTotal: 0, mesesConDatos: 0, especiesDetectadas: 0 },
        grafico_mensual: [],
        grafico_especies: []
      };
    }
  }

  /**
   * Calcula los KPIs principales
   * @param {Array} data - Datos filtrados
   * @returns {Object} KPIs calculados
   */
  static calcularKPIs(data) {
    let cosechaTotal = 0;
    const mesesSet = new Set();
    const especiesSet = new Set();

    data.forEach(item => {
      // Sumar toneladas
      cosechaTotal += this.extractToneladas(item);

      // Contar meses únicos
      const mes = this.extractMes(item);
      if (mes && mes !== 'Sin mes') {
        mesesSet.add(mes);
      }

      // Contar especies únicas
      const especie = this.extractEspecie(item);
      if (especie && especie !== 'SIN ESPECIE') {
        especiesSet.add(especie);
      }
    });

    return {
      cosechaTotal: Math.round(cosechaTotal * 100) / 100, // Redondear a 2 decimales
      mesesConDatos: mesesSet.size,
      especiesDetectadas: especiesSet.size
    };
  }

  /**
   * Calcula datos para el gráfico mensual
   * @param {Array} data - Datos filtrados
   * @returns {Array} Array de objetos {mes, toneladas}
   */
  static calcularGraficoMensual(data) {
    const mensualMap = new Map();

    data.forEach(item => {
      const mes = this.extractMes(item);
      const toneladas = this.extractToneladas(item);

      if (mensualMap.has(mes)) {
        mensualMap.set(mes, mensualMap.get(mes) + toneladas);
      } else {
        mensualMap.set(mes, toneladas);
      }
    });

    // Convertir a array y ordenar por mes
    const resultado = Array.from(mensualMap.entries())
      .map(([mes, toneladas]) => ({
        mes,
        toneladas: Math.round(toneladas * 100) / 100
      }))
      .sort((a, b) => {
        // Intentar ordenar numéricamente si son números
        const mesA = parseInt(a.mes);
        const mesB = parseInt(b.mes);
        if (!isNaN(mesA) && !isNaN(mesB)) {
          return mesA - mesB;
        }
        return String(a.mes).localeCompare(String(b.mes));
      });

    return resultado;
  }

  /**
   * Calcula datos para el gráfico de especies
   * Usa el módulo normalizar para agrupar y sumar
   * @param {Array} data - Datos filtrados
   * @returns {Array} Array de objetos {especie, toneladas}
   */
  static calcularGraficoEspecies(data) {
    // Usar la función agruparYSumar del módulo normalizar
    const agrupado = agruparYSumar(data, 'especie');
    
    // Convertir al formato esperado
    return agrupado.map(({ clave, total }) => ({
      especie: clave,
      toneladas: Math.round(total * 100) / 100
    }));
  }
}

module.exports = CosechaService;
