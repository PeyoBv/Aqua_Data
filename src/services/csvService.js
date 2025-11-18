const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('../config');

/**
 * Servicio para leer archivos CSV
 */
class CsvService {
  /**
   * Lee un archivo CSV y devuelve los datos como array de objetos
   * @param {string} fileName - Nombre del archivo CSV
   * @returns {Promise<Array>} Array con los datos del CSV
   */
  static async readCsvFile(fileName) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = path.join(config.csvBasePath, fileName);

      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`Archivo no encontrado: ${filePath}`));
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Lista todos los archivos CSV en el directorio base
   * @returns {Array<string>} Array con nombres de archivos CSV
   */
  static listCsvFiles() {
    const dirPath = config.csvBasePath;

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return [];
    }

    return fs.readdirSync(dirPath)
      .filter(file => path.extname(file).toLowerCase() === '.csv');
  }
}

module.exports = CsvService;
