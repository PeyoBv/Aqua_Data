const express = require('express');
const router = express.Router();
const CsvController = require('../controllers/csvController');

// Ruta para listar archivos CSV disponibles
router.get('/files', CsvController.listFiles);

// Ruta para leer un archivo CSV específico
router.get('/files/:filename', CsvController.readFile);

module.exports = router;
