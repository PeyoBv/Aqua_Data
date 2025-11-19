const ExploradorService = require('../services/exploradorService');

/**
 * Controlador para exploración dinámica de datos
 */
class ExploradorController {
  /**
   * GET /api/v1/explorador
   * Endpoint dinámico para explorar diferentes datasets
   * 
   * Query params:
   * - tipo_dato: cosecha, produccion o plantas (REQUERIDO)
   * - region: LAGOS, AYSEN, MAGALLANES o TODAS
   * - anio: Año específico
   * - mes: Mes específico (1-12)
   * - especie: Especie (búsqueda parcial)
   * - tipo_elaboracion: Tipo de elaboración (solo para producción)
   * - cd_planta: Código de planta (solo para plantas)
   */
  static async explorarDatos(req, res) {
    try {
      const { tipo_dato, ...filtros } = req.query;

      if (!tipo_dato) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro requerido',
          message: 'Debe especificar el parámetro "tipo_dato" (cosecha, produccion o plantas)'
        });
      }

      const resultado = ExploradorService.explorarDatos(tipo_dato, filtros);

      res.json(resultado);

    } catch (error) {
      console.error('Error en explorarDatos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/explorador/opciones-disponibles
   * Obtiene las opciones disponibles para los filtros (años, especies, tipos, plantas)
   */
  static async obtenerOpcionesDisponibles(req, res) {
    try {
      const dataStore = require('../data/dataStore');
      
      // Obtener todos los datasets
      const cosechas = dataStore.getDesembarques();
      const produccion = dataStore.getMateriaPrimaProduccion();
      
      // Combinar todos los datos para obtener todas las opciones
      const todosDatos = [...cosechas, ...produccion];
      
      const años = new Set();
      const especies = new Set();
      const tiposElaboracion = new Set();
      
      todosDatos.forEach(item => {
        // Años
        const año = parseInt(item.año || item.AÑO || item.anio || item.ANIO);
        if (año && !isNaN(año) && año > 1900) años.add(año);
        
        // Especies
        const especie = (item.especie || item.ESPECIE || '').trim();
        if (especie) especies.add(especie);
        
        // Tipos de elaboración
        const tipo = (item.tipo_elaboracion || item.TIPO_ELABORACION || '').trim();
        if (tipo) tiposElaboracion.add(tipo);
      });
      
      const opciones = {
        años_disponibles: Array.from(años).sort((a, b) => b - a),
        especies_disponibles: Array.from(especies).sort(),
        tipos_elaboracion: Array.from(tiposElaboracion).sort()
      };
      
      res.json({
        success: true,
        opciones
      });

    } catch (error) {
      console.error('Error en obtenerOpcionesDisponibles:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
}

module.exports = ExploradorController;
