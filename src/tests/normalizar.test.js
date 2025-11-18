/**
 * Tests para el módulo de normalización
 * Valida funciones de normalización de texto, parseo de decimales y enteros
 */

const {
  normalizarTexto,
  parsearDecimal,
  parsearEntero,
  normalizarAnio,
  normalizarMes,
  normalizarDesembarque,
  normalizarMateriaPrima,
  normalizarPlanta,
  filtrarDatos,
  obtenerValoresUnicos,
  agruparYSumar
} = require('../utils/normalizar');

describe('Módulo de Normalización - Funciones Básicas', () => {
  
  describe('normalizarTexto()', () => {
    test('debe convertir texto a MAYÚSCULAS y eliminar espacios', () => {
      expect(normalizarTexto('  los lagos  ')).toBe('LOS LAGOS');
    });

    test('debe manejar texto con tildes correctamente', () => {
      expect(normalizarTexto('Región de Valparaíso')).toBe('REGIÓN DE VALPARAÍSO');
    });

    test('debe retornar cadena vacía para valores nulos', () => {
      expect(normalizarTexto(null)).toBe('');
      expect(normalizarTexto(undefined)).toBe('');
      expect(normalizarTexto('')).toBe('');
    });

    test('debe convertir números a texto en MAYÚSCULAS', () => {
      expect(normalizarTexto(123)).toBe('123');
    });
  });

  describe('parsearDecimal()', () => {
    test('debe parsear decimales con punto', () => {
      expect(parsearDecimal('1234.56')).toBe(1234.56);
    });

    test('debe parsear decimales con coma', () => {
      expect(parsearDecimal('1234,56')).toBe(1234.56);
    });

    test('debe parsear formato europeo (1.234,56)', () => {
      expect(parsearDecimal('1.234,56')).toBe(1234.56);
    });

    test('debe parsear formato anglosajón (1,234.56)', () => {
      expect(parsearDecimal('1,234.56')).toBe(1234.56);
    });

    test('debe retornar 0 para valores nulos o inválidos', () => {
      expect(parsearDecimal(null)).toBe(0);
      expect(parsearDecimal(undefined)).toBe(0);
      expect(parsearDecimal('')).toBe(0);
      expect(parsearDecimal('N/A')).toBe(0);
      expect(parsearDecimal('abc')).toBe(0);
    });

    test('debe manejar números sin formato especial', () => {
      expect(parsearDecimal(1234.56)).toBe(1234.56);
      expect(parsearDecimal('999')).toBe(999);
    });
  });

  describe('parsearEntero()', () => {
    test('debe parsear enteros correctamente', () => {
      expect(parsearEntero('2013')).toBe(2013);
      expect(parsearEntero('  42  ')).toBe(42);
    });

    test('debe retornar 0 para valores nulos o inválidos', () => {
      expect(parsearEntero(null)).toBe(0);
      expect(parsearEntero(undefined)).toBe(0);
      expect(parsearEntero('')).toBe(0);
      expect(parsearEntero('abc')).toBe(0);
    });

    test('debe convertir números a enteros', () => {
      expect(parsearEntero(2013)).toBe(2013);
    });
  });

  describe('normalizarAnio()', () => {
    test('debe validar años en rango 1900-2100', () => {
      expect(normalizarAnio(2013)).toBe(2013);
      expect(normalizarAnio('2000')).toBe(2000);
      expect(normalizarAnio(2100)).toBe(2100);
      expect(normalizarAnio(1900)).toBe(1900);
    });

    test('debe retornar 0 para años fuera de rango', () => {
      expect(normalizarAnio(1899)).toBe(0);
      expect(normalizarAnio(2101)).toBe(0);
      expect(normalizarAnio(500)).toBe(0);
    });

    test('debe retornar 0 para valores inválidos', () => {
      expect(normalizarAnio(null)).toBe(0);
      expect(normalizarAnio('abc')).toBe(0);
    });
  });

  describe('normalizarMes()', () => {
    test('debe validar meses en rango 1-12', () => {
      expect(normalizarMes('6')).toBe(6);
      expect(normalizarMes(12)).toBe(12);
      expect(normalizarMes(1)).toBe(1);
    });

    test('debe retornar 0 para meses fuera de rango', () => {
      expect(normalizarMes(0)).toBe(0);
      expect(normalizarMes(13)).toBe(0);
      expect(normalizarMes(-1)).toBe(0);
    });

    test('debe retornar 0 para valores inválidos', () => {
      expect(normalizarMes(null)).toBe(0);
      expect(normalizarMes('abc')).toBe(0);
    });
  });
});

describe('Módulo de Normalización - Normalización por Tipo', () => {
  
  describe('normalizarDesembarque()', () => {
    test('debe normalizar un objeto de desembarque completo', () => {
      const datoCrudo = {
        id: '123',
        año: '2013',
        aguas: 'ALTA MAR',
        region: '  los lagos  ',
        cd_puerto: '10',
        puerto_desembarque: 'Puerto Montt',
        mes: '6',
        cd_especie: '5',
        especie: 'jurel',
        toneladas: '1.234,56',
        tipo_agente: 'industrial'
      };

      const resultado = normalizarDesembarque(datoCrudo);

      expect(resultado).toEqual({
        id: 123,
        año: 2013,
        aguas: 'ALTA MAR',
        region: 'LOS LAGOS',
        cd_puerto: 10,
        puerto_desembarque: 'PUERTO MONTT',
        mes: 6,
        cd_especie: 5,
        especie: 'JUREL',
        toneladas: 1234.56,
        tipo_agente: 'INDUSTRIAL'
      });
    });

    test('debe manejar campos faltantes con valores por defecto', () => {
      const datoCrudo = {
        año: '2013',
        region: 'valparaiso'
      };

      const resultado = normalizarDesembarque(datoCrudo);

      expect(resultado.id).toBe(0);
      expect(resultado.año).toBe(2013);
      expect(resultado.region).toBe('VALPARAISO');
      expect(resultado.toneladas).toBe(0);
    });
  });

  describe('normalizarMateriaPrima()', () => {
    test('debe normalizar un objeto de materia prima', () => {
      const datoCrudo = {
        id: '456',
        año: '2014',
        region: 'los lagos',
        cd_planta: '20',
        planta: 'Planta XYZ',
        mes: '8',
        cd_especie: '3',
        especie: 'SALMON',
        tipo_elaboracion: 'CONGELADO',
        toneladas_mp: '500,75',
        toneladas_elaboradas: '450,50'
      };

      const resultado = normalizarMateriaPrima(datoCrudo);

      expect(resultado.id).toBe(456);
      expect(resultado.año).toBe(2014);
      expect(resultado.region).toBe('LOS LAGOS');
      expect(resultado.toneladas_mp).toBe(500.75);
      expect(resultado.toneladas_elaboradas).toBe(450.5);
    });
  });
});

describe('Módulo de Normalización - Utilidades de Análisis', () => {
  
  const datosEjemplo = [
    { año: 2013, region: 'LOS LAGOS', especie: 'JUREL', toneladas: 100, mes: 1 },
    { año: 2013, region: 'VALPARAISO', especie: 'MERLUZA', toneladas: 200, mes: 2 },
    { año: 2014, region: 'LOS LAGOS', especie: 'JUREL', toneladas: 150, mes: 1 },
    { año: 2014, region: 'LOS LAGOS', especie: 'SARDINA', toneladas: 300, mes: 3 }
  ];

  describe('filtrarDatos()', () => {
    test('debe filtrar por año', () => {
      const resultado = filtrarDatos(datosEjemplo, { año: 2013 });
      expect(resultado).toHaveLength(2);
      expect(resultado.every(d => d.año === 2013)).toBe(true);
    });

    test('debe filtrar por región (normalizado automáticamente)', () => {
      const resultado = filtrarDatos(datosEjemplo, { region: 'los lagos' });
      expect(resultado).toHaveLength(3);
      expect(resultado.every(d => d.region === 'LOS LAGOS')).toBe(true);
    });

    test('debe filtrar por especie (búsqueda parcial)', () => {
      const resultado = filtrarDatos(datosEjemplo, { especie: 'jur' });
      expect(resultado).toHaveLength(2);
      expect(resultado.every(d => d.especie.includes('JUREL'))).toBe(true);
    });

    test('debe aplicar múltiples filtros', () => {
      const resultado = filtrarDatos(datosEjemplo, { 
        año: 2014, 
        region: 'los lagos' 
      });
      expect(resultado).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay coincidencias', () => {
      const resultado = filtrarDatos(datosEjemplo, { año: 2020 });
      expect(resultado).toHaveLength(0);
    });

    test('debe manejar array vacío o inválido', () => {
      expect(filtrarDatos([], { año: 2013 })).toEqual([]);
      expect(filtrarDatos(null, { año: 2013 })).toEqual([]);
    });
  });

  describe('obtenerValoresUnicos()', () => {
    test('debe extraer valores únicos de un campo', () => {
      const años = obtenerValoresUnicos(datosEjemplo, 'año');
      expect(años).toEqual([2013, 2014]);
    });

    test('debe retornar valores ordenados', () => {
      const especies = obtenerValoresUnicos(datosEjemplo, 'especie');
      expect(especies).toEqual(['JUREL', 'MERLUZA', 'SARDINA']);
    });

    test('debe excluir valores nulos o vacíos', () => {
      const datosConNulos = [
        { campo: 'A' },
        { campo: null },
        { campo: '' },
        { campo: 0 },
        { campo: 'B' }
      ];
      const resultado = obtenerValoresUnicos(datosConNulos, 'campo');
      expect(resultado).toEqual(['A', 'B']);
    });

    test('debe manejar array vacío o campo inválido', () => {
      expect(obtenerValoresUnicos([], 'año')).toEqual([]);
      expect(obtenerValoresUnicos(datosEjemplo, null)).toEqual([]);
    });
  });

  describe('agruparYSumar()', () => {
    test('debe agrupar y sumar toneladas por especie', () => {
      const resultado = agruparYSumar(datosEjemplo, 'especie');
      
      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toEqual({ clave: 'SARDINA', total: 300 });
      expect(resultado[1]).toEqual({ clave: 'JUREL', total: 250 });
      expect(resultado[2]).toEqual({ clave: 'MERLUZA', total: 200 });
    });

    test('debe agrupar y sumar toneladas por región', () => {
      const resultado = agruparYSumar(datosEjemplo, 'region');
      
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({ clave: 'LOS LAGOS', total: 550 });
      expect(resultado[1]).toEqual({ clave: 'VALPARAISO', total: 200 });
    });

    test('debe retornar array vacío para datos inválidos', () => {
      expect(agruparYSumar([], 'especie')).toEqual([]);
      expect(agruparYSumar(datosEjemplo, null)).toEqual([]);
    });

    test('debe ordenar resultados por total descendente', () => {
      const resultado = agruparYSumar(datosEjemplo, 'especie');
      
      // Verificar orden descendente
      for (let i = 0; i < resultado.length - 1; i++) {
        expect(resultado[i].total).toBeGreaterThanOrEqual(resultado[i + 1].total);
      }
    });
  });
});

describe('Módulo de Normalización - Casos Edge', () => {
  
  test('debe manejar valores extremos en parsearDecimal', () => {
    expect(parsearDecimal('999999999.99')).toBe(999999999.99);
    expect(parsearDecimal('0.01')).toBe(0.01);
    expect(parsearDecimal('-1234.56')).toBe(-1234.56);
  });

  test('debe manejar strings con espacios en parsearDecimal', () => {
    expect(parsearDecimal('  1234.56  ')).toBe(1234.56);
  });

  test('debe manejar caracteres especiales en normalizarTexto', () => {
    expect(normalizarTexto('Ñuñoa')).toBe('ÑUÑOA');
    expect(normalizarTexto('Región Metropolitana')).toBe('REGIÓN METROPOLITANA');
  });
});
