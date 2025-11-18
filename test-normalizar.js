/**
 * Script de prueba para el módulo normalizar.js
 * Verifica que todas las funciones de normalización funcionen correctamente
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
} = require('./src/utils/normalizar');

console.log('🧪 Iniciando pruebas del módulo normalizar.js\n');

// Test 1: normalizarTexto
console.log('1️⃣  Test normalizarTexto:');
console.log('   Input: "  los lagos  " →', normalizarTexto("  los lagos  "));
console.log('   Input: null →', normalizarTexto(null));
console.log('   Input: "" →', normalizarTexto(""));
console.log('   Input: "Región de Valparaíso" →', normalizarTexto("Región de Valparaíso"));

// Test 2: parsearDecimal
console.log('\n2️⃣  Test parsearDecimal:');
console.log('   Input: "1234.56" →', parsearDecimal("1234.56"));
console.log('   Input: "1234,56" →', parsearDecimal("1234,56"));
console.log('   Input: "1.234,56" →', parsearDecimal("1.234,56"));
console.log('   Input: "1,234.56" →', parsearDecimal("1,234.56"));
console.log('   Input: null →', parsearDecimal(null));
console.log('   Input: "N/A" →', parsearDecimal("N/A"));

// Test 3: parsearEntero
console.log('\n3️⃣  Test parsearEntero:');
console.log('   Input: "2013" →', parsearEntero("2013"));
console.log('   Input: "  42  " →', parsearEntero("  42  "));
console.log('   Input: null →', parsearEntero(null));
console.log('   Input: "abc" →', parsearEntero("abc"));

// Test 4: normalizarAnio
console.log('\n4️⃣  Test normalizarAnio:');
console.log('   Input: 2013 →', normalizarAnio(2013));
console.log('   Input: "2000" →', normalizarAnio("2000"));
console.log('   Input: 1899 →', normalizarAnio(1899));
console.log('   Input: 2101 →', normalizarAnio(2101));

// Test 5: normalizarMes
console.log('\n5️⃣  Test normalizarMes:');
console.log('   Input: "6" →', normalizarMes("6"));
console.log('   Input: 12 →', normalizarMes(12));
console.log('   Input: 0 →', normalizarMes(0));
console.log('   Input: 13 →', normalizarMes(13));

// Test 6: normalizarDesembarque
console.log('\n6️⃣  Test normalizarDesembarque:');
const datoCrudo = {
  id: '123',
  año: '2013',
  region: '  los lagos  ',
  especie: 'jurel',
  toneladas: '1.234,56',
  mes: '6'
};
console.log('   Input:', datoCrudo);
console.log('   Output:', normalizarDesembarque(datoCrudo));

// Test 7: filtrarDatos
console.log('\n7️⃣  Test filtrarDatos:');
const datosEjemplo = [
  { año: 2013, region: 'LOS LAGOS', especie: 'JUREL', toneladas: 100 },
  { año: 2013, region: 'VALPARAISO', especie: 'MERLUZA', toneladas: 200 },
  { año: 2014, region: 'LOS LAGOS', especie: 'JUREL', toneladas: 150 },
  { año: 2014, region: 'LOS LAGOS', especie: 'SARDINA', toneladas: 300 }
];

console.log('   Datos originales:', datosEjemplo.length, 'registros');
const filtradosPorAnio = filtrarDatos(datosEjemplo, { año: 2013 });
console.log('   Filtrado año=2013:', filtradosPorAnio.length, 'registros');

const filtradosPorRegion = filtrarDatos(datosEjemplo, { region: 'los lagos' });
console.log('   Filtrado region="los lagos":', filtradosPorRegion.length, 'registros');

const filtradosMultiple = filtrarDatos(datosEjemplo, { año: 2014, region: 'los lagos' });
console.log('   Filtrado año=2014 + region="los lagos":', filtradosMultiple.length, 'registros');

// Test 8: obtenerValoresUnicos
console.log('\n8️⃣  Test obtenerValoresUnicos:');
const aniosUnicos = obtenerValoresUnicos(datosEjemplo, 'año');
console.log('   Años únicos:', aniosUnicos);

const regionesUnicas = obtenerValoresUnicos(datosEjemplo, 'region');
console.log('   Regiones únicas:', regionesUnicas);

const especiesUnicas = obtenerValoresUnicos(datosEjemplo, 'especie');
console.log('   Especies únicas:', especiesUnicas);

// Test 9: agruparYSumar
console.log('\n9️⃣  Test agruparYSumar:');
const agrupadoPorEspecie = agruparYSumar(datosEjemplo, 'especie');
console.log('   Agrupado por especie:', agrupadoPorEspecie);

const agrupadoPorRegion = agruparYSumar(datosEjemplo, 'region');
console.log('   Agrupado por región:', agrupadoPorRegion);

console.log('\n✅ Pruebas completadas!');
