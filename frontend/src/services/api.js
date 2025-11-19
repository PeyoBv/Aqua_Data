import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Servicio para consumir la API de cosechas (legacy)
 */
export const cosechasAPI = {
  /**
   * Obtiene datos de cosechas con filtros opcionales
   * @param {Object} params - Parámetros de filtro { anio, region, especie }
   * @returns {Promise} Promesa con los datos de la API
   */
  async getCosechas(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/cosechas`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cosechas:', error);
      throw error;
    }
  }
};

/**
 * Obtiene panorama general de una región
 * @param {string} region - Código de región (LAGOS, AYSEN, MAGALLANES, TODAS)
 * @returns {Promise} Promesa con los datos del panorama
 */
export async function getPanoramaGeneral(region = 'TODAS') {
  try {
    const response = await axios.get(`${API_BASE_URL}/general`, {
      params: { region }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching panorama general:', error);
    throw error;
  }
}

/**
 * Explora datos dinámicamente según tipo y filtros
 * @param {Object} params - Parámetros { tipo_dato, region, anio, mes, especie, etc. }
 * @returns {Promise} Promesa con los datos explorados
 */
export async function explorarDatos(params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/explorador`, { params });
    return response.data;
  } catch (error) {
    console.error('Error explorando datos:', error);
    throw error;
  }
}

/**
 * Obtiene opciones disponibles para filtros (años, especies, tipos, plantas)
 * @returns {Promise} Promesa con las opciones disponibles
 */
export async function obtenerOpcionesDisponibles() {
  try {
    const response = await axios.get(`${API_BASE_URL}/explorador/opciones-disponibles`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo opciones disponibles:', error);
    throw error;
  }
}

/**
 * ============================================================================
 * MÓDULO DE COSECHAS - Nuevas APIs
 * ============================================================================
 */

/**
 * Obtiene distribución por tipo de agente (Industrial vs Artesanal)
 * @param {number|null} year - Año específico (opcional)
 * @param {string|null} region - Región específica (opcional)
 * @returns {Promise} Promesa con datos para Donut Chart
 */
export async function getAgentDistribution(year = null, region = null) {
  try {
    const params = {};
    if (year) params.year = year;
    if (region) params.region = region;
    
    const response = await axios.get(`${API_BASE_URL}/cosechas/agent-distribution`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching agent distribution:', error);
    throw error;
  }
}

/**
 * Obtiene ranking de puertos por volumen
 * @param {number|null} year - Año específico (opcional)
 * @param {string|null} region - Región específica (opcional)
 * @param {number} topN - Número de puertos a retornar
 * @returns {Promise} Promesa con datos para Bar Chart
 */
export async function getTopPorts(year = null, region = null, topN = 10) {
  try {
    const params = { top_n: topN };
    if (year) params.year = year;
    if (region) params.region = region;
    
    const response = await axios.get(`${API_BASE_URL}/cosechas/top-ports`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top ports:', error);
    throw error;
  }
}

/**
 * Obtiene desglose de especies por tipo de agente
 * @param {number|null} year - Año específico (opcional)
 * @param {string|null} region - Región específica (opcional)
 * @param {number} topN - Número de especies a analizar
 * @returns {Promise} Promesa con datos para Stacked Bar Chart
 */
export async function getSpeciesByAgentBreakdown(year = null, region = null, topN = 10) {
  try {
    const params = { top_n: topN };
    if (year) params.year = year;
    if (region) params.region = region;
    
    const response = await axios.get(`${API_BASE_URL}/cosechas/species-breakdown`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching species breakdown:', error);
    throw error;
  }
}

/**
 * Obtiene contexto estacional (año actual vs histórico)
 * @param {number} currentYear - Año actual a comparar
 * @param {string|null} region - Región específica (opcional)
 * @returns {Promise} Promesa con datos para Line Chart comparativo
 */
export async function getSeasonalContext(currentYear = 2023, region = null) {
  try {
    const params = { current_year: currentYear };
    if (region) params.region = region;
    
    const response = await axios.get(`${API_BASE_URL}/cosechas/seasonal-context`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching seasonal context:', error);
    throw error;
  }
}

export default cosechasAPI;
