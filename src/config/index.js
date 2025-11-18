require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  csvBasePath: process.env.CSV_BASE_PATH || './Base de Datos',
  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;
