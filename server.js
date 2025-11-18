const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Rutas principales
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor Express funcionando correctamente',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', routes);

// Puerto del servidor
const PORT = process.env.PORT || 3000;

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
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

module.exports = app;
