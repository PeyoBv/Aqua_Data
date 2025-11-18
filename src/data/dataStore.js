/**
 * Almacenamiento global de datos en memoria
 * Los datos se cargan al iniciar el servidor
 */

// Arrays globales para almacenar los datos CSV
let desembarques = [];
let materiaPrimaProduccion = [];
let plantas = [];

/**
 * Establece los datos de desembarques
 * @param {Array} data - Array de datos
 */
function setDesembarques(data) {
  desembarques = data;
}

/**
 * Obtiene los datos de desembarques
 * @returns {Array} Array de desembarques
 */
function getDesembarques() {
  return desembarques;
}

/**
 * Establece los datos de materia prima y producción
 * @param {Array} data - Array de datos
 */
function setMateriaPrimaProduccion(data) {
  materiaPrimaProduccion = data;
}

/**
 * Obtiene los datos de materia prima y producción
 * @returns {Array} Array de materia prima y producción
 */
function getMateriaPrimaProduccion() {
  return materiaPrimaProduccion;
}

/**
 * Establece los datos de plantas
 * @param {Array} data - Array de datos
 */
function setPlantas(data) {
  plantas = data;
}

/**
 * Obtiene los datos de plantas
 * @returns {Array} Array de plantas
 */
function getPlantas() {
  return plantas;
}

/**
 * Obtiene estadísticas sobre los datos cargados
 * @returns {Object} Objeto con estadísticas
 */
function getDataStats() {
  return {
    desembarques: {
      count: desembarques.length,
      loaded: desembarques.length > 0
    },
    materiaPrimaProduccion: {
      count: materiaPrimaProduccion.length,
      loaded: materiaPrimaProduccion.length > 0
    },
    plantas: {
      count: plantas.length,
      loaded: plantas.length > 0
    }
  };
}

/**
 * Inicializa todos los datos con los valores proporcionados
 * @param {Object} data - Objeto con todos los datos
 */
function initializeData(data) {
  if (data.desembarques) setDesembarques(data.desembarques);
  if (data.materiaPrimaProduccion) setMateriaPrimaProduccion(data.materiaPrimaProduccion);
  if (data.plantas) setPlantas(data.plantas);
}

module.exports = {
  setDesembarques,
  getDesembarques,
  setMateriaPrimaProduccion,
  getMateriaPrimaProduccion,
  setPlantas,
  getPlantas,
  getDataStats,
  initializeData
};
