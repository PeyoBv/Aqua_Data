const GeneralService = require('../services/generalService');

/**
 * Controlador para endpoints generales y comparativos
 */
class GeneralController {
  /**
   * GET /api/v1/general
   * Obtiene panorama general con KPIs comparativos
   * 
   * Query params:
   * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
   */
  static async getPanoramaGeneral(req, res) {
    try {
      const { region = 'TODAS' } = req.query;

      const resultado = GeneralService.obtenerPanoramaRegional(region);

      res.json(resultado);

    } catch (error) {
      console.error('Error en getPanoramaGeneral:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
}

module.exports = GeneralController;
