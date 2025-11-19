import axios from 'axios';

// Configurar la URL base según el entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtiene el panorama general de una región
 * @param {string} region - Nombre de la región (Lagos, Aysén, Magallanes)
 * @returns {Promise} Datos del panorama regional
 */
export const getPanoramaGeneral = async (region) => {
  const response = await api.get('/general', {
    params: { region }
  });
  return response.data;
};

/**
 * Explora datos con filtros dinámicos
 * @param {Object} params - Parámetros de filtrado
 * @returns {Promise} Datos filtrados
 */
export const explorarDatos = async (params) => {
  const response = await api.get('/explorador', { params });
  return response.data;
};

/**
 * Health check de la API
 * @returns {Promise} Estado de la API
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
