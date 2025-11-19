const express = require('express');
const cors = require('cors');
const v1Routes = require('../src/routes/v1Routes');
const DataLoaderService = require('../src/services/dataLoaderService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Variable global para almacenar datos
let dataCache = null;

// Inicializar datos si no existen
async function initializeData() {
  if (!dataCache) {
    console.log('🔄 Cargando datos en memoria...');
    dataCache = await DataLoaderService.loadAllData();
    console.log('✅ Datos cargados');
  }
  return dataCache;
}

// Middleware para inyectar datos en req
app.use(async (req, res, next) => {
  try {
    req.data = await initializeData();
    next();
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    res.status(500).json({ error: 'Error cargando datos' });
  }
});

// Rutas API
app.use('/api/v1', v1Routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando correctamente',
    data: {
      desembarques: req.data?.desembarques?.length || 0,
      materiaPrimaProduccion: req.data?.materiaPrimaProduccion?.length || 0,
      plantas: req.data?.plantas?.length || 0
    }
  });
});

module.exports = app;
