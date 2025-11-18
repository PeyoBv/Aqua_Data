const express = require('express');
const router = express.Router();
const CosechaController = require('../controllers/cosechaController');
const GeneralController = require('../controllers/generalController');
const ExploradorController = require('../controllers/exploradorController');

/**
 * GET /api/v1/general
 * Obtiene panorama general con KPIs comparativos
 * 
 * Query params opcionales:
 * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
 */
router.get('/general', GeneralController.getPanoramaGeneral);

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
router.get('/explorador', ExploradorController.explorarDatos);

/**
 * GET /api/v1/cosechas
 * Obtiene KPIs y gráficos de cosechas (endpoint legacy)
 * 
 * Query params opcionales:
 * - anio: Filtrar por año
 * - region: Filtrar por región
 * - especie: Filtrar por especie
 */
router.get('/cosechas', CosechaController.getCosechas);

module.exports = router;
