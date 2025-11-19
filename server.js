const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const routes = require('./src/routes');
const DataLoaderService = require('./src/services/dataLoaderService');
const dataStore = require('./src/data/dataStore');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (antes de servir archivos estáticos)
app.use('/api', routes);

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'frontend', 'dist');
  app.use(express.static(frontendPath));
  
  // Todas las rutas no-API sirven el index.html (para React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // En desarrollo, solo mostrar mensaje en la raíz
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Servidor Express funcionando correctamente',
      version: '1.0.0',
      mode: 'development'
    });
  });
}

// Puerto del servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Función para iniciar el servidor
async function startServer() {
  try {
    // Cargar datos CSV en memoria al iniciar
    const data = await DataLoaderService.loadAllData();
    dataStore.initializeData(data);

    // Mostrar estadísticas de datos cargados
    const stats = dataStore.getDataStats();
    console.log('📊 Datos en memoria:');
    console.log(`   - Desembarques: ${stats.desembarques.count} registros`);
    console.log(`   - Materia Prima/Producción: ${stats.materiaPrimaProduccion.count} registros`);
    console.log(`   - Plantas: ${stats.plantas.count} registros\n`);

    // Iniciar servidor
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

module.exports = app;
