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
 * Obtiene la lista de especies únicas, opcionalmente filtrada por región
 * @param {string} region - Región para filtrar (opcional)
 * @returns {Array<string>} Lista de especies ordenadas alfabéticamente
 */
function getUniqueSpecies(region = null) {
  let data = desembarques;

  // Filtrar por región si se proporciona
  if (region && region !== 'TODAS' && region !== '') {
    data = data.filter(d => d.region === region);
  }

  // Extraer especies únicas
  const speciesSet = new Set();
  data.forEach(d => {
    if (d.especie) {
      speciesSet.add(d.especie);
    }
  });

  return Array.from(speciesSet).sort();
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
  initializeData,
  getUniqueSpecies
};
