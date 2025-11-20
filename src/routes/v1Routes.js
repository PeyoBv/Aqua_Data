const express = require('express');
const router = express.Router();
const CosechaController = require('../controllers/cosechaController');
const GeneralController = require('../controllers/generalController');
const ExploradorController = require('../controllers/exploradorController');
const CosechasModuleController = require('../controllers/cosechasModuleController');
const ProduccionController = require('../controllers/produccionController');

/**
 * GET /api/v1/general
 * Obtiene panorama general con KPIs comparativos
 * 
 * Query params opcionales:
 * - region: LAGOS, AYSEN, MAGALLANES o TODAS (default: TODAS)
 */
router.get('/general', GeneralController.getPanoramaGeneral);

/**
 * GET /api/v1/explorador/opciones-disponibles
 * Obtiene las opciones disponibles para filtros (años, especies, tipos, plantas)
 */
router.get('/explorador/opciones-disponibles', ExploradorController.obtenerOpcionesDisponibles);

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

// ======================================================
// MÓDULO AVANZADO DE COSECHAS - Analytics
// ======================================================

/**
 * GET /api/v1/cosechas/agent-distribution
 * Distribución por Tipo de Agente (Industrial vs Artesanal)
 * 
 * Query params opcionales:
 * - year: Año específico (ej: 2023)
 * - region: Región específica (LAGOS, AYSEN, MAGALLANES, TODAS)
 */
router.get('/cosechas/agent-distribution', CosechasModuleController.getAgentDistribution);

/**
 * GET /api/v1/cosechas/top-ports
 * Ranking de Puertos por Volumen
 * 
 * Query params opcionales:
 * - year: Año específico
 * - region: Región específica
 * - top_n: Número de puertos a retornar (default: 10)
 */
router.get('/cosechas/top-ports', CosechasModuleController.getTopPorts);

/**
 * GET /api/v1/cosechas/species-breakdown
 * Desglose de Especies por Tipo de Agente (Stacked Bar)
 * 
 * Query params opcionales:
 * - year: Año específico
 * - region: Región específica
 * - top_n: Número de especies a retornar (default: 10)
 */
router.get('/cosechas/species-breakdown', CosechasModuleController.getSpeciesByAgentBreakdown);

/**
 * GET /api/v1/cosechas/seasonal-context
 * Contexto Estacional: Año Actual vs Promedio Histórico
 * 
 * Query params opcionales:
 * - current_year: Año a analizar (default: 2023)
 * - region: Región específica
 */
router.get('/cosechas/seasonal-context', CosechasModuleController.getSeasonalContext);

// ======================================================
// MÓDULO DE PRODUCCIÓN - Dashboard de Materia Prima
// ======================================================

/**
 * GET /api/v1/produccion/estadisticas
 * KPIs generales de producción: Total MP, Producción, Especies, Rendimiento
 * 
 * Query params opcionales:
 * - region: Región específica
 * - anio: Año específico
 * - especie: Especie específica
 * - linea_elaboracion: Línea de elaboración
 */
router.get('/produccion/estadisticas', ProduccionController.getEstadisticas);

/**
 * GET /api/v1/produccion/balance-masas
 * Balance de Masas por Año (Materia Prima vs Producción)
 * 
 * Query params opcionales:
 * - region: Región específica
 * - especie: Especie específica
 * - linea_elaboracion: Línea de elaboración
 */
router.get('/produccion/balance-masas', ProduccionController.getBalanceMasas);

/**
 * GET /api/v1/produccion/perfil-industrial
 * Perfil Industrial: Distribución por Línea de Elaboración
 * 
 * Query params opcionales:
 * - region: Región específica
 * - anio: Año específico
 * - especie: Especie específica
 */
router.get('/produccion/perfil-industrial', ProduccionController.getPerfilIndustrial);

/**
 * GET /api/v1/produccion/opciones
 * Obtiene opciones disponibles para filtros de producción
 */
router.get('/produccion/opciones', ProduccionController.getOpciones);

module.exports = router;
