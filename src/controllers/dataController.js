const dataStore = require('../data/dataStore');

/**
 * Controlador para acceso a datos cargados en memoria
 */
class DataController {
  /**
   * Obtiene todos los desembarques
   */
  static getDesembarques(req, res) {
    try {
      const data = dataStore.getDesembarques();
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todos los datos de materia prima y producción
   */
  static getMateriaPrimaProduccion(req, res) {
    try {
      const data = dataStore.getMateriaPrimaProduccion();
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todos los datos de plantas
   */
  static getPlantas(req, res) {
    try {
      const data = dataStore.getPlantas();
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de todos los datos cargados
   */
  static getStats(req, res) {
    try {
      const stats = dataStore.getDataStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = DataController;
