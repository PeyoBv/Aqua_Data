/**
 * Test Script - Módulo de Cosechas
 * 
 * Este script prueba todos los endpoints del módulo de análisis avanzado de Cosechas
 * y genera un reporte de pruebas en la consola.
 * 
 * Uso: node test-cosechas-module.js
 */

const axios = require('axios');

// Configuración
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1/cosechas`;

// Colores para consola
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper para imprimir
const log = {
  info: (msg) => console.log(`${COLORS.cyan}ℹ ${msg}${COLORS.reset}`),
  success: (msg) => console.log(`${COLORS.green}✅ ${msg}${COLORS.reset}`),
  error: (msg) => console.log(`${COLORS.red}❌ ${msg}${COLORS.reset}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠️ ${msg}${COLORS.reset}`),
  title: (msg) => console.log(`\n${COLORS.blue}═══ ${msg} ═══${COLORS.reset}\n`)
};

// Tests
const tests = [
  {
    name: 'Agent Distribution - Sin filtros',
    url: `${API_BASE}/agent-distribution`,
    validate: (data) => {
      return data.success === true &&
             Array.isArray(data.data) &&
             data.data.length > 0 &&
             data.summary &&
             data.summary.total_toneladas > 0;
    }
  },
  {
    name: 'Agent Distribution - Filtrado por año 2023',
    url: `${API_BASE}/agent-distribution?year=2023`,
    validate: (data) => {
      return data.success === true &&
             data.metadata.year === 2023;
    }
  },
  {
    name: 'Agent Distribution - Filtrado por región Los Lagos',
    url: `${API_BASE}/agent-distribution?region=Los Lagos`,
    validate: (data) => {
      return data.success === true &&
             data.metadata.region === 'Los Lagos';
    }
  },
  {
    name: 'Top Ports - Sin filtros',
    url: `${API_BASE}/top-ports`,
    validate: (data) => {
      return data.success === true &&
             Array.isArray(data.data) &&
             data.data.every(port => port.ranking && port.puerto && port.toneladas);
    }
  },
  {
    name: 'Top Ports - Top 5 para 2023 en Los Lagos',
    url: `${API_BASE}/top-ports?year=2023&region=Los Lagos&top_n=5`,
    validate: (data) => {
      return data.success === true &&
             data.metadata.top_n === 5 &&
             data.data.length <= 5;
    }
  },
  {
    name: 'Species Breakdown - Sin filtros',
    url: `${API_BASE}/species-breakdown`,
    validate: (data) => {
      return data.success === true &&
             Array.isArray(data.data) &&
             data.summary.num_especies > 0;
    }
  },
  {
    name: 'Species Breakdown - Top 10 para 2022',
    url: `${API_BASE}/species-breakdown?year=2022&top_n=10`,
    validate: (data) => {
      return data.success === true &&
             data.metadata.top_n === 10 &&
             data.data.length <= 10;
    }
  },
  {
    name: 'Seasonal Context - Año 2023',
    url: `${API_BASE}/seasonal-context?current_year=2023`,
    validate: (data) => {
      return data.success === true &&
             Array.isArray(data.data) &&
             data.data.length === 12 &&
             data.data.every(m => m.actual !== undefined && m.historico !== undefined);
    }
  },
  {
    name: 'Seasonal Context - Año 2024 para MAGALLANES',
    url: `${API_BASE}/seasonal-context?current_year=2024&region=MAGALLANES`,
    validate: (data) => {
      return data.success === true &&
             data.metadata.current_year === 2024 &&
             data.metadata.region === 'MAGALLANES';
    }
  }
];

// Ejecutar tests
async function runTests() {
  log.title('PRUEBA DEL MÓDULO DE COSECHAS');
  log.info(`API Base: ${API_BASE}`);
  log.info(`Total de pruebas: ${tests.length}\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      log.info(`Ejecutando: ${test.name}`);
      const response = await axios.get(test.url);
      
      if (test.validate(response.data)) {
        log.success(`PASSED - ${test.name}`);
        passed++;
        results.push({ test: test.name, status: 'PASSED' });
      } else {
        log.error(`FAILED - ${test.name} (Validación fallida)`);
        failed++;
        results.push({ test: test.name, status: 'FAILED', reason: 'Validation failed' });
      }
      
      // Mostrar resumen de datos
      if (response.data.summary) {
        console.log(`   📊 Summary:`, JSON.stringify(response.data.summary, null, 2));
      }
      console.log('');
      
    } catch (error) {
      log.error(`FAILED - ${test.name}`);
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      }
      console.log('');
      failed++;
      results.push({ 
        test: test.name, 
        status: 'FAILED', 
        reason: error.message 
      });
    }
  }

  // Reporte final
  log.title('REPORTE DE PRUEBAS');
  console.log(`Total de pruebas: ${tests.length}`);
  log.success(`Pruebas exitosas: ${passed}`);
  if (failed > 0) {
    log.error(`Pruebas fallidas: ${failed}`);
  }
  
  const passRate = ((passed / tests.length) * 100).toFixed(2);
  console.log(`\nTasa de éxito: ${passRate}%\n`);

  // Tabla de resultados
  console.table(results);

  // Código de salida
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runTests().catch(error => {
  log.error('Error ejecutando tests:');
  console.error(error);
  process.exit(1);
});
