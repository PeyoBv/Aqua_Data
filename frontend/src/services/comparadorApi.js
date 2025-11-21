import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Obtiene especies disponibles en ambos datasets
 */
export const getEspeciesDisponibles = async () => {
  try {
    const response = await axios.get(`${API_URL}/comparador/especies-disponibles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching especies disponibles:', error);
    throw error;
  }
};

/**
 * Obtiene datos de trazabilidad para una especie
 */
export const getTrazabilidad = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/comparador/trazabilidad`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trazabilidad:', error);
    throw error;
  }
};

/**
 * Obtiene matriz de destino para una especie
 */
export const getMatrizDestino = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/comparador/matriz-destino`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching matriz destino:', error);
    throw error;
  }
};

/**
 * Obtiene la evolución del destino industrial por línea de elaboración
 * Para gráfico de áreas apiladas (Stacked Area Chart)
 */
export const getEvolucionDestino = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/comparador/evolucion-destino`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching evolución destino:', error);
    throw error;
  }
};

/**
 * Obtiene comparación regional de captura vs procesamiento
 * Para gráfico de barras agrupadas (Grouped Bar Chart)
 */
export const getComparacionRegional = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/comparador/comparacion-regional`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching comparación regional:', error);
    throw error;
  }
};

/**
 * Obtiene comparación Year-over-Year entre dos años específicos
 * Para análisis de tendencias y variaciones anuales
 */
export const getComparacionYoY = async ({ especie, yearA, yearB, region = 'TODAS' }) => {
  try {
    const response = await axios.get(`${API_URL}/comparador/comparacion-yoy`, {
      params: { especie, yearA, yearB, region }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comparación YoY:', error);
    throw error;
  }
};
