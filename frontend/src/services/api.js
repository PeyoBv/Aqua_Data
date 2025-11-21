import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Log para debugging
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 MODE:', import.meta.env.MODE);

// Interceptor de Axios para logging
axios.interceptors.request.use(
  config => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ Response Error:', error.message, error.config?.url);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

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

/**
 * ============================================================================
 * MÓDULO DE PRODUCCIÓN - APIs para Dashboard de Materia Prima
 * ============================================================================
 */

/**
 * Obtiene estadísticas generales de producción (KPIs)
 * @param {Object} filtros - Filtros opcionales { region, anio, especie, linea_elaboracion }
 * @returns {Promise} Promesa con estadísticas para KPI Cards
 */
export async function getEstadisticasProduccion(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/produccion/estadisticas`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching estadísticas producción:', error);
    throw error;
  }
}

/**
 * Obtiene balance de masas por año (Materia Prima vs Producción)
 * @param {Object} filtros - Filtros opcionales { region, especie, linea_elaboracion }
 * @returns {Promise} Promesa con datos para Grouped Bar Chart
 */
export async function getBalanceMasas(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/produccion/balance-masas`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching balance de masas:', error);
    throw error;
  }
}

/**
 * Obtiene perfil industrial (distribución por línea de elaboración)
 * @param {Object} filtros - Filtros opcionales { region, anio, especie }
 * @returns {Promise} Promesa con datos para Donut Chart
 */
export async function getPerfilIndustrial(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/produccion/perfil-industrial`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching perfil industrial:', error);
    throw error;
  }
}

/**
 * Obtiene opciones disponibles para filtros de producción
 * @returns {Promise} Promesa con opciones para selectores
 */
export async function getOpcionesProduccion() {
  try {
    const response = await axios.get(`${API_BASE_URL}/produccion/opciones`);
    return response.data;
  } catch (error) {
    console.error('Error fetching opciones producción:', error);
    throw error;
  }
}

/**
 * ============================================================================
 * MÓDULO DE PLANTAS - APIs para Infraestructura Industrial
 * ============================================================================
 */

/**
 * Obtiene estadísticas generales de plantas (KPIs)
 * @param {Object} filtros - Filtros opcionales { region, anio }
 * @returns {Promise} Promesa con estadísticas para KPI Cards
 */
export async function getEstadisticasPlantas(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/plantas/estadisticas`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching estadísticas plantas:', error);
    throw error;
  }
}

/**
 * Obtiene evolución tecnológica por año (Stacked Bar Chart)
 * @param {Object} filtros - Filtros opcionales { region }
 * @returns {Promise} Promesa con datos para Stacked Bar Chart
 */
export async function getEvolucionTecnologica(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/plantas/evolucion-tecnologica`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching evolución tecnológica:', error);
    throw error;
  }
}

/**
 * Obtiene distribución de procesos (Treemap / Pie Chart)
 * @param {Object} filtros - Filtros opcionales { region, anio }
 * @returns {Promise} Promesa con datos para Treemap Chart
 */
export async function getDistribucionProcesos(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/plantas/distribucion-procesos`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching distribución procesos:', error);
    throw error;
  }
}

/**
 * Obtiene top complejos industriales (Bar Chart Horizontal)
 * @param {Object} filtros - Filtros opcionales { region, anio, top_n }
 * @returns {Promise} Promesa con datos para Horizontal Bar Chart
 */
export async function getTopComplejos(filtros = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/plantas/top-complejos`, { 
      params: filtros 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top complejos:', error);
    throw error;
  }
}

/**
 * Obtiene opciones disponibles para filtros de plantas
 * @returns {Promise} Promesa con opciones para selectores
 */
export async function getOpcionesPlantas() {
  try {
    const response = await axios.get(`${API_BASE_URL}/plantas/opciones`);
    return response.data;
  } catch (error) {
    console.error('Error fetching opciones plantas:', error);
    throw error;
  }
}

/**
 * Obtiene la distribución de líneas de producción (tecnología) por año
 * @param {Object} params - Parámetros de filtro { region, year }
 * @returns {Promise} Promesa con datos de distribución tecnológica
 */
export async function getDistribucionTecnologica(params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/general/distribucion-tecnologica`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching distribución tecnológica:', error);
    throw error;
  }
}

export default cosechasAPI;
