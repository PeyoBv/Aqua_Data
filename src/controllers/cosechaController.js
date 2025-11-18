const CosechaService = require('../services/cosechaService');

/**
 * Controlador para endpoints de cosechas
 */
class CosechaController {
  /**
   * GET /api/v1/cosechas
   * Obtiene KPIs y gráficos de cosechas según filtros
   * 
   * Query params:
   * - anio: Año a filtrar (número)
   * - region: Región a filtrar (texto)
   * - especie: Especie a filtrar (texto)
   */
  static getCosechas(req, res) {
    try {
      // Extraer filtros de query string
      const { anio, region, especie } = req.query;

      // Construir objeto de filtros
      const filters = {};
      if (anio) filters.anio = anio;
      if (region) filters.region = region;
      if (especie) filters.especie = especie;

      // Calcular cosechas con el servicio
      const resultado = CosechaService.calcularCosechas(filters);

      // Verificar si hubo error
      if (!resultado.success) {
        return res.status(resultado.error ? 500 : 404).json(resultado);
      }

      // Respuesta exitosa
      res.json(resultado);

    } catch (error) {
      console.error('Error en getCosechas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
        kpis: { cosechaTotal: 0, mesesConDatos: 0, especiesDetectadas: 0 },
        grafico_mensual: [],
        grafico_especies: []
      });
    }
  }
}

module.exports = CosechaController;
