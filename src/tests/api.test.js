/**
 * Tests para el endpoint de la API
 * Valida respuestas correctas con diferentes filtros
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const v1Routes = require('../routes/v1Routes');
const DataLoaderService = require('../services/dataLoaderService');
const dataStore = require('../data/dataStore');

// Crear app de Express para tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1', v1Routes);

describe('API Endpoint - GET /api/v1/cosechas', () => {
  
  // Cargar datos antes de ejecutar los tests
  beforeAll(async () => {
    const allData = await DataLoaderService.loadAllData();
    dataStore.initializeData(
      allData.desembarques,
      allData.materiaPrimaProduccion,
      allData.plantas
    );
  });

  describe('Sin filtros', () => {
    test('debe retornar datos con status 200', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toBeDefined();
    });

    test('debe tener estructura correcta de respuesta', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas');
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('kpis');
      expect(response.body).toHaveProperty('grafico_mensual');
      expect(response.body).toHaveProperty('grafico_especies');
    });

    test('debe incluir KPIs con valores numéricos', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas');
      
      const { kpis } = response.body;
      
      expect(kpis).toHaveProperty('cosechaTotal');
      expect(kpis).toHaveProperty('mesesConDatos');
      expect(kpis).toHaveProperty('especiesDetectadas');
      
      expect(typeof kpis.cosechaTotal).toBe('number');
      expect(typeof kpis.mesesConDatos).toBe('number');
      expect(typeof kpis.especiesDetectadas).toBe('number');
      
      expect(kpis.cosechaTotal).toBeGreaterThan(0);
    });

    test('debe incluir datos de gráfico mensual', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas');
      
      const { grafico_mensual } = response.body;
      
      expect(Array.isArray(grafico_mensual)).toBe(true);
      expect(grafico_mensual.length).toBeGreaterThan(0);
      
      // Verificar estructura del primer elemento
      if (grafico_mensual.length > 0) {
        expect(grafico_mensual[0]).toHaveProperty('mes');
        expect(grafico_mensual[0]).toHaveProperty('toneladas');
      }
    });

    test('debe incluir datos de gráfico de especies', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas');
      
      const { grafico_especies } = response.body;
      
      expect(Array.isArray(grafico_especies)).toBe(true);
      expect(grafico_especies.length).toBeGreaterThan(0);
      
      // Verificar estructura del primer elemento
      if (grafico_especies.length > 0) {
        expect(grafico_especies[0]).toHaveProperty('especie');
        expect(grafico_especies[0]).toHaveProperty('toneladas');
      }
    });
  });

  describe('Filtro por año', () => {
    test('debe filtrar correctamente por año 2013', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=2013')
        .expect(200);
      
      expect(response.body.filters).toHaveProperty('anio', 2013);
      expect(response.body.success).toBe(true);
    });

    test('debe retornar datos para año válido', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=2013');
      
      const { kpis } = response.body;
      
      expect(kpis.cosechaTotal).toBeGreaterThan(0);
      expect(kpis.mesesConDatos).toBeGreaterThan(0);
    });

    test('debe retornar 0 para año sin datos', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=1990')
        .expect(200);
      
      const { kpis } = response.body;
      
      expect(kpis.cosechaTotal).toBe(0);
      expect(kpis.mesesConDatos).toBe(0);
      expect(kpis.especiesDetectadas).toBe(0);
    });
  });

  describe('Filtro por región', () => {
    test('debe filtrar correctamente por región "Los Lagos"', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?region=Los Lagos')
        .expect(200);
      
      expect(response.body.filters).toHaveProperty('region', 'LOS LAGOS');
      expect(response.body.success).toBe(true);
    });

    test('debe normalizar región a MAYÚSCULAS automáticamente', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?region=los%20lagos');
      
      expect(response.body.filters.region).toBe('LOS LAGOS');
    });

    test('debe retornar datos para región válida', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?region=Los Lagos');
      
      const { kpis } = response.body;
      
      expect(kpis.cosechaTotal).toBeGreaterThan(0);
    });

    test('debe retornar 0 para región sin datos', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?region=Region Inexistente')
        .expect(200);
      
      const { kpis } = response.body;
      
      expect(kpis.cosechaTotal).toBe(0);
    });
  });

  describe('Filtro por especie', () => {
    test('debe filtrar correctamente por especie "jurel"', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?especie=jurel')
        .expect(200);
      
      expect(response.body.filters).toHaveProperty('especie', 'JUREL');
      expect(response.body.success).toBe(true);
    });

    test('debe normalizar especie a MAYÚSCULAS automáticamente', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?especie=jurel');
      
      expect(response.body.filters.especie).toBe('JUREL');
    });

    test('debe soportar búsqueda parcial de especie', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?especie=jur');
      
      const { kpis } = response.body;
      
      // Si hay especies que contengan "JUR", debe retornar datos
      if (kpis.especiesDetectadas > 0) {
        expect(kpis.cosechaTotal).toBeGreaterThan(0);
      }
    });
  });

  describe('Filtros combinados', () => {
    test('debe aplicar múltiples filtros simultáneamente', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=2013&region=Los Lagos')
        .expect(200);
      
      expect(response.body.filters).toHaveProperty('anio', 2013);
      expect(response.body.filters).toHaveProperty('region', 'LOS LAGOS');
    });

    test('debe combinar año, región y especie', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=2013&region=Los Lagos&especie=jurel')
        .expect(200);
      
      expect(response.body.filters.anio).toBe(2013);
      expect(response.body.filters.region).toBe('LOS LAGOS');
      expect(response.body.filters.especie).toBe('JUREL');
    });

    test('debe retornar menos datos con más filtros', async () => {
      const sinFiltros = await request(app).get('/api/v1/cosechas');
      const conUnFiltro = await request(app).get('/api/v1/cosechas?anio=2013');
      const conDosFiltros = await request(app).get('/api/v1/cosechas?anio=2013&region=Los Lagos');
      
      // El total con más filtros debe ser menor o igual
      expect(conDosFiltros.body.kpis.cosechaTotal)
        .toBeLessThanOrEqual(conUnFiltro.body.kpis.cosechaTotal);
    });
  });

  describe('Validación de datos de respuesta', () => {
    test('gráfico mensual debe estar ordenado por mes', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=2013');
      
      const { grafico_mensual } = response.body;
      
      // Verificar que los meses estén en orden
      for (let i = 0; i < grafico_mensual.length - 1; i++) {
        expect(Number(grafico_mensual[i].mes))
          .toBeLessThanOrEqual(Number(grafico_mensual[i + 1].mes));
      }
    });

    test('gráfico de especies debe estar ordenado descendente por toneladas', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=2013');
      
      const { grafico_especies } = response.body;
      
      // Verificar orden descendente
      for (let i = 0; i < grafico_especies.length - 1; i++) {
        expect(grafico_especies[i].toneladas)
          .toBeGreaterThanOrEqual(grafico_especies[i + 1].toneladas);
      }
    });

    test('las toneladas deben ser números positivos o cero', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas');
      
      const { grafico_mensual, grafico_especies } = response.body;
      
      grafico_mensual.forEach(item => {
        expect(item.toneladas).toBeGreaterThanOrEqual(0);
      });
      
      grafico_especies.forEach(item => {
        expect(item.toneladas).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Casos edge', () => {
    test('debe manejar parámetros vacíos', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?anio=&region=&especie=')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('debe manejar caracteres especiales en especie', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?especie=ñ')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('debe manejar espacios en parámetros', async () => {
      const response = await request(app)
        .get('/api/v1/cosechas?region=Los%20Lagos')
        .expect(200);
      
      expect(response.body.filters.region).toBe('LOS LAGOS');
    });
  });

  describe('Performance', () => {
    test('debe responder en menos de 2 segundos', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/v1/cosechas?anio=2013')
        .expect(200);
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000);
    }, 3000); // timeout de 3 segundos

    test('debe manejar múltiples requests simultáneas', async () => {
      const requests = [
        request(app).get('/api/v1/cosechas?anio=2013'),
        request(app).get('/api/v1/cosechas?region=Los Lagos'),
        request(app).get('/api/v1/cosechas?especie=jurel')
      ];
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
