const ComparadorService = require('../services/comparadorService');

/**
 * Controlador para el módulo Comparador
 * Cruza datos de Cosechas (Oferta) con Producción (Demanda)
 */
class ComparadorController {
  /**
   * GET /api/v1/comparador/especies-disponibles
   * Obtiene especies que existen en ambos datasets
   */
  static async getEspeciesDisponibles(req, res) {
    try {
      const resultado = ComparadorService.obtenerEspeciesComunes();
      res.json(resultado);
    } catch (error) {
      console.error('Error en getEspeciesDisponibles:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/comparador/trazabilidad
   * Obtiene datos de trazabilidad para una especie
   * 
   * Query params:
   * - especie: Nombre de la especie (requerido)
   * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
   */
  static async getTrazabilidad(req, res) {
    try {
      const { especie, region = 'TODAS' } = req.query;

      if (!especie) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro especie es requerido'
        });
      }

      const resultado = ComparadorService.obtenerTrazabilidad(especie, region);
      res.json(resultado);

    } catch (error) {
      console.error('Error en getTrazabilidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/comparador/matriz-destino
   * Obtiene la matriz de destino para una especie
   * 
   * Query params:
   * - especie: Nombre de la especie (requerido)
   * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
   */
  static async getMatrizDestino(req, res) {
    try {
      const { especie, region = 'TODAS' } = req.query;

      if (!especie) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro especie es requerido'
        });
      }

      const resultado = ComparadorService.obtenerMatrizDestino(especie, region);
      res.json(resultado);

    } catch (error) {
      console.error('Error en getMatrizDestino:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/comparador/evolucion-destino
   * Obtiene la evolución del destino industrial por línea de elaboración
   * Para gráfico de áreas apiladas (Stacked Area Chart)
   * 
   * Query params:
   * - especie: Nombre de la especie (requerido)
   * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
   */
  static async getEvolucionDestino(req, res) {
    try {
      const { especie, region = 'TODAS' } = req.query;

      if (!especie) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro especie es requerido'
        });
      }

      const resultado = ComparadorService.obtenerEvolucionDestinoIndustrial(especie, region);
      res.json(resultado);

    } catch (error) {
      console.error('Error en getEvolucionDestino:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/comparador/comparacion-regional
   * Obtiene comparación regional de captura vs procesamiento
   * Para gráfico de barras agrupadas (Grouped Bar Chart)
   * 
   * Query params:
   * - especie: Nombre de la especie (requerido)
   * - year: Año específico o "TODOS" para acumulado (opcional, default: "TODOS")
   */
  static async getComparacionRegional(req, res) {
    try {
      const { especie, year = 'TODOS', region = 'TODAS' } = req.query;

      if (!especie) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro especie es requerido'
        });
      }

      const resultado = ComparadorService.obtenerComparacionRegional(especie, year, region);
      res.json(resultado);

    } catch (error) {
      console.error('Error en getComparacionRegional:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/comparador/comparacion-yoy
   * Obtiene comparación Year-over-Year entre dos años específicos
   * Query params: especie (required), yearA (required), yearB (required), region (optional)
   */
  static async getComparacionYoY(req, res) {
    try {
      const { especie, yearA, yearB, region = 'TODAS' } = req.query;

      if (!especie || !yearA || !yearB) {
        return res.status(400).json({
          success: false,
          error: 'Los parámetros especie, yearA y yearB son requeridos'
        });
      }

      const resultado = ComparadorService.obtenerComparacionYoY(especie, yearA, yearB, region);
      res.json(resultado);

    } catch (error) {
      console.error('Error en getComparacionYoY:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/comparador/matriz-estacionalidad
   * Obtiene matriz de estacionalidad (Mapa de Calor)
   * 
   * Query params:
   * - especie: Nombre de la especie (requerido)
   * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
   */
  static async getMatrizEstacionalidad(req, res) {
    try {
      const { especie, region = 'TODAS' } = req.query;

      if (!especie) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro especie es requerido'
        });
      }

      const resultado = ComparadorService.obtenerMatrizEstacionalidad(especie, region);
      res.json(resultado);

    } catch (error) {
      console.error('Error en getMatrizEstacionalidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
}

module.exports = ComparadorController;
