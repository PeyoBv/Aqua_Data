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

export default cosechasAPI;
