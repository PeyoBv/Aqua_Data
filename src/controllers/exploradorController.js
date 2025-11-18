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
}

module.exports = ExploradorController;
