const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('../config');
const { 
  normalizarDesembarque, 
  normalizarMateriaPrima, 
  normalizarPlanta,
  esRegionMacroZonaSur
} = require('../utils/normalizar');

/**
 * Servicio para cargar y gestionar datos CSV en memoria
 */
class DataLoaderService {
  /**
   * Lee un archivo CSV, normaliza los datos y los retorna
   * @param {string} fileName - Nombre del archivo CSV
   * @param {Function} normalizer - Función para normalizar cada fila
   * @returns {Promise<Array>} Array con los datos normalizados
   */
  static async loadCsvFile(fileName, normalizer = null) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = path.join(config.csvBasePath, fileName);

      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Archivo no encontrado: ${filePath}`);
        return resolve([]); // Retornar array vacío en lugar de error
      }

      console.log(`📂 Cargando archivo: ${fileName}...`);

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Aplicar normalización si se proporciona una función
          const normalizedData = normalizer ? normalizer(data) : data;
          results.push(normalizedData);
        })
        .on('end', () => {
          console.log(`✅ ${fileName} cargado: ${results.length} registros`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error(`❌ Error cargando ${fileName}:`, error.message);
          reject(error);
        });
    });
  }

  /**
   * Normaliza los datos de desembarques (delegado al módulo normalizar)
   * @param {Object} row - Fila del CSV
   * @returns {Object} Fila normalizada
   */
  static normalizeDesembarque(row) {
    return normalizarDesembarque(row);
  }

  /**
   * Normaliza los datos de materia prima y producción (delegado al módulo normalizar)
   * @param {Object} row - Fila del CSV
   * @returns {Object} Fila normalizada
   */
  static normalizeMateriaPrimaProduccion(row) {
    return normalizarMateriaPrima(row);
  }

  /**
   * Normaliza los datos de plantas (delegado al módulo normalizar)
   * @param {Object} row - Fila del CSV
   * @returns {Object} Fila normalizada
   */
  static normalizePlanta(row) {
    return normalizarPlanta(row);
  }

  /**
   * Carga todos los archivos CSV necesarios
   * @returns {Promise<Object>} Objeto con todos los datos cargados
   */
  static async loadAllData() {
    try {
      console.log('\n🚀 Iniciando carga de datos CSV...\n');

      // Rutas completas a cada archivo CSV en sus carpetas respectivas
      const basePath = path.join(config.csvBasePath);
      
      const [desembarques, materiaPrimaProduccion, plantas] = await Promise.all([
        this.loadCsvFileFromPath(
          path.join(basePath, 'BD_desembarque', 'BD_desembarque.csv'),
          this.normalizeDesembarque
        ),
        this.loadCsvFileFromPath(
          path.join(basePath, 'BD_materia_prima_produccion', 'BD_materia_prima_produccion.csv'),
          this.normalizeMateriaPrimaProduccion
        ),
        this.loadCsvFileFromPath(
          path.join(basePath, 'BD_plantas', 'BD_plantas.csv'),
          this.normalizePlanta
        )
      ]);

      console.log('\n✨ Carga de datos completada\n');

      return {
        desembarques,
        materiaPrimaProduccion,
        plantas
      };
    } catch (error) {
      console.error('❌ Error en la carga de datos:', error);
      throw error;
    }
  }

  /**
   * Lee un archivo CSV desde una ruta completa con filtro regional
   * @param {string} filePath - Ruta completa al archivo CSV
   * @param {Function} normalizer - Función para normalizar cada fila
   * @param {boolean} applyRegionalFilter - Si debe aplicar filtro de Macro-Zona Sur
   * @returns {Promise<Array>} Array con los datos normalizados y filtrados
   */
  static async loadCsvFileFromPath(filePath, normalizer = null, applyRegionalFilter = true) {
    return new Promise((resolve, reject) => {
      const results = [];
      let totalRows = 0;
      let filteredRows = 0;

      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Archivo no encontrado: ${filePath}`);
        return resolve([]); // Retornar array vacío en lugar de error
      }

      console.log(`📂 Cargando archivo: ${path.basename(filePath)}...`);

      fs.createReadStream(filePath, { encoding: 'latin1' })
        .pipe(csv({ separator: ';' })) // Usar punto y coma como delimitador
        .on('data', (data) => {
          totalRows++;
          
          // Aplicar normalización si se proporciona una función
          const normalizedData = normalizer ? normalizer(data) : data;
          
          // Aplicar filtro regional de Macro-Zona Sur (Lagos, Aysén, Magallanes)
          if (applyRegionalFilter) {
            const region = normalizedData.region || normalizedData.REGION || '';
            if (esRegionMacroZonaSur(region)) {
              results.push(normalizedData);
            } else {
              filteredRows++;
            }
          } else {
            results.push(normalizedData);
          }
        })
        .on('end', () => {
          if (applyRegionalFilter) {
            console.log(`✅ ${path.basename(filePath)}: ${results.length} registros Macro-Zona Sur (${filteredRows} filtrados de ${totalRows} totales)`);
          } else {
            console.log(`✅ ${path.basename(filePath)} cargado: ${results.length} registros`);
          }
          resolve(results);
        })
        .on('error', (error) => {
          console.error(`❌ Error cargando ${path.basename(filePath)}:`, error.message);
          reject(error);
        });
    });
  }
}

module.exports = DataLoaderService;
