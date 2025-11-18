const CsvService = require('../services/csvService');

/**
 * Controlador para operaciones con archivos CSV
 */
class CsvController {
  /**
   * Obtiene la lista de archivos CSV disponibles
   */
  static listFiles(req, res) {
    try {
      const files = CsvService.listCsvFiles();
      res.json({
        success: true,
        count: files.length,
        files
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Lee y devuelve el contenido de un archivo CSV
   */
  static async readFile(req, res) {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          error: 'El nombre del archivo es requerido'
        });
      }

      const data = await CsvService.readCsvFile(filename);
      
      res.json({
        success: true,
        filename,
        rowCount: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = CsvController;
