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

// Servir archivos estáticos (ajusta 'frontend/dist' si es Vite o 'frontend/build' si es CRA)
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// API Routes (antes de servir archivos estáticos)
app.use('/api', routes);

// Catch-all handler: Cualquier petición que no sea API, devuelve el React App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

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
