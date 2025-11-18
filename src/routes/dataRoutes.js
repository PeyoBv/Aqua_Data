const express = require('express');
const router = express.Router();
const DataController = require('../controllers/dataController');

// Rutas para acceder a los datos cargados en memoria
router.get('/desembarques', DataController.getDesembarques);
router.get('/materia-prima-produccion', DataController.getMateriaPrimaProduccion);
router.get('/plantas', DataController.getPlantas);
router.get('/stats', DataController.getStats);

module.exports = router;
