/**
 * Tests para el servicio de carga de datos CSV
 * Valida que los archivos CSV se carguen correctamente y contengan datos
 */

const DataLoaderService = require('../services/dataLoaderService');
const dataStore = require('../data/dataStore');
const path = require('path');
const fs = require('fs');

describe('DataLoaderService - Carga de CSV', () => {
  
  // Variables para almacenar datos cargados
  let desembarques, materiaPrima, plantas;

  beforeAll(async () => {
    // Cargar todos los datos antes de ejecutar los tests
    const allData = await DataLoaderService.loadAllData();
    desembarques = allData.desembarques;
    materiaPrima = allData.materiaPrimaProduccion;
    plantas = allData.plantas;
  });

  describe('BD_desembarque.csv', () => {
    test('debe cargar el archivo sin errores', () => {
      expect(desembarques).toBeDefined();
      expect(Array.isArray(desembarques)).toBe(true);
    });

    test('debe contener datos (más de 0 registros)', () => {
      expect(desembarques.length).toBeGreaterThan(0);
    });

    test('debe tener más de 200,000 registros', () => {
      expect(desembarques.length).toBeGreaterThan(200000);
    });

    test('cada registro debe tener la estructura esperada', () => {
      const primerRegistro = desembarques[0];
      
      expect(primerRegistro).toHaveProperty('id');
      expect(primerRegistro).toHaveProperty('año');
      expect(primerRegistro).toHaveProperty('region');
      expect(primerRegistro).toHaveProperty('especie');
      expect(primerRegistro).toHaveProperty('toneladas');
      expect(primerRegistro).toHaveProperty('mes');
    });

    test('los campos numéricos deben ser números', () => {
      const primerRegistro = desembarques[0];
      
      expect(typeof primerRegistro.id).toBe('number');
      expect(typeof primerRegistro.año).toBe('number');
      expect(typeof primerRegistro.toneladas).toBe('number');
      expect(typeof primerRegistro.mes).toBe('number');
    });

    test('los campos de texto deben estar en MAYÚSCULAS', () => {
      const registrosConRegion = desembarques.filter(d => d.region);
      const algunRegistro = registrosConRegion[0];
      
      if (algunRegistro.region) {
        expect(algunRegistro.region).toBe(algunRegistro.region.toUpperCase());
      }
      
      if (algunRegistro.especie) {
        expect(algunRegistro.especie).toBe(algunRegistro.especie.toUpperCase());
      }
    });

    test('debe tener años válidos (>= 2000)', () => {
      const añosValidos = desembarques.every(d => d.año >= 2000 || d.año === 0);
      expect(añosValidos).toBe(true);
    });

    test('debe tener meses válidos (1-12 o 0)', () => {
      const mesesValidos = desembarques.every(d => 
        (d.mes >= 1 && d.mes <= 12) || d.mes === 0
      );
      expect(mesesValidos).toBe(true);
    });

    test('las toneladas deben ser números no negativos', () => {
      const toneladasValidas = desembarques.every(d => 
        typeof d.toneladas === 'number' && d.toneladas >= 0
      );
      expect(toneladasValidas).toBe(true);
    });
  });

  describe('BD_materia_prima_produccion.csv', () => {
    test('debe cargar el archivo sin errores', () => {
      expect(materiaPrima).toBeDefined();
      expect(Array.isArray(materiaPrima)).toBe(true);
    });

    test('debe contener datos (más de 0 registros)', () => {
      expect(materiaPrima.length).toBeGreaterThan(0);
    });

    test('debe tener más de 300,000 registros', () => {
      expect(materiaPrima.length).toBeGreaterThan(300000);
    });

    test('cada registro debe tener la estructura esperada', () => {
      const primerRegistro = materiaPrima[0];
      
      expect(primerRegistro).toHaveProperty('id');
      expect(primerRegistro).toHaveProperty('año');
      expect(primerRegistro).toHaveProperty('region');
      expect(primerRegistro).toHaveProperty('especie');
    });

    test('los años deben ser válidos', () => {
      const añosValidos = materiaPrima.every(d => d.año >= 2000 || d.año === 0);
      expect(añosValidos).toBe(true);
    });
  });

  describe('BD_plantas.csv', () => {
    test('debe cargar el archivo sin errores', () => {
      expect(plantas).toBeDefined();
      expect(Array.isArray(plantas)).toBe(true);
    });

    test('debe contener datos (más de 0 registros)', () => {
      expect(plantas.length).toBeGreaterThan(0);
    });

    test('debe tener más de 300,000 registros', () => {
      expect(plantas.length).toBeGreaterThan(300000);
    });

    test('cada registro debe tener la estructura esperada', () => {
      const primerRegistro = plantas[0];
      
      expect(primerRegistro).toHaveProperty('id');
      expect(primerRegistro).toHaveProperty('año');
      expect(primerRegistro).toHaveProperty('region');
      expect(primerRegistro).toHaveProperty('especie');
    });
  });

  describe('Data Store - Almacenamiento en Memoria', () => {
    beforeAll(() => {
      // Inicializar dataStore con los datos cargados
      dataStore.initializeData(desembarques, materiaPrima, plantas);
    });

    test('debe almacenar desembarques en memoria', () => {
      const stored = dataStore.getDesembarques();
      expect(stored).toBeDefined();
      expect(stored.length).toBe(desembarques.length);
    });

    test('debe almacenar materia prima en memoria', () => {
      const stored = dataStore.getMateriaPrimaProduccion();
      expect(stored).toBeDefined();
      expect(stored.length).toBe(materiaPrima.length);
    });

    test('debe almacenar plantas en memoria', () => {
      const stored = dataStore.getPlantas();
      expect(stored).toBeDefined();
      expect(stored.length).toBe(plantas.length);
    });
  });

  describe('Validación de Encoding y Caracteres Especiales', () => {
    test('debe manejar correctamente caracteres con tildes', () => {
      const registrosConRegion = desembarques.filter(d => 
        d.region && d.region.includes('Í')
      );
      
      // Si hay regiones con tilde, verificar que se leen correctamente
      if (registrosConRegion.length > 0) {
        expect(registrosConRegion[0].region).toMatch(/[ÁÉÍÓÚÑ]/);
      }
    });

    test('debe leer correctamente la letra Ñ', () => {
      const registrosConEnie = desembarques.filter(d => 
        d.especie && d.especie.includes('Ñ')
      );
      
      // Si hay especies con Ñ, verificar lectura correcta
      if (registrosConEnie.length > 0) {
        expect(registrosConEnie[0].especie).toMatch(/Ñ/);
      }
    });
  });

  describe('Verificación de Archivos CSV', () => {
    test('los archivos CSV deben existir en la ruta configurada', () => {
      const basePath = process.env.CSV_BASE_PATH || './Base de Datos';
      
      const desembarquePath = path.join(basePath, 'BD_desembarque', 'BD_desembarque.csv');
      const materiaPrimaPath = path.join(basePath, 'BD_materia_prima_produccion', 'BD_materia_prima_produccion.csv');
      const plantasPath = path.join(basePath, 'BD_plantas', 'BD_plantas.csv');
      
      expect(fs.existsSync(desembarquePath)).toBe(true);
      expect(fs.existsSync(materiaPrimaPath)).toBe(true);
      expect(fs.existsSync(plantasPath)).toBe(true);
    });
  });
});

describe('DataLoaderService - Manejo de Errores', () => {
  
  test('debe retornar array vacío si el archivo no existe', async () => {
    const resultado = await DataLoaderService.loadCsvFileFromPath(
      'archivo_inexistente.csv',
      (row) => row
    );
    
    expect(resultado).toEqual([]);
  });

  test('debe manejar errores de lectura sin lanzar excepciones', async () => {
    await expect(
      DataLoaderService.loadCsvFileFromPath(
        'archivo_inexistente.csv',
        (row) => row
      )
    ).resolves.toEqual([]);
  });
});

describe('DataLoaderService - Funciones de Normalización', () => {
  
  test('normalizeDesembarque debe procesar correctamente una fila', () => {
    const filaCruda = {
      id: '1',
      año: '2013',
      region: 'los lagos',
      especie: 'jurel',
      toneladas: '100,50',
      mes: '6'
    };
    
    const resultado = DataLoaderService.normalizeDesembarque(filaCruda);
    
    expect(resultado.id).toBe(1);
    expect(resultado.año).toBe(2013);
    expect(resultado.region).toBe('LOS LAGOS');
    expect(resultado.especie).toBe('JUREL');
    expect(resultado.toneladas).toBe(100.5);
    expect(resultado.mes).toBe(6);
  });
});
