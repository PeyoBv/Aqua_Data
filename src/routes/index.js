const express = require('express');
const router = express.Router();
const csvRoutes = require('./csvRoutes');
const dataRoutes = require('./dataRoutes');
const v1Routes = require('./v1Routes');

// Rutas CSV
router.use('/csv', csvRoutes);

// Rutas de datos en memoria
router.use('/data', dataRoutes);

// Rutas API v1
router.use('/v1', v1Routes);

module.exports = router;
