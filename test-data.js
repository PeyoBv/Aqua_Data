// Script de prueba para verificar estructura de datos
const dataStore = require('./src/data/dataStore');

const desembarques = dataStore.getDesembarques();

console.log('\n=== ANÁLISIS DE DATOS CARGADOS ===\n');
console.log('Total de registros:', desembarques.length);

if (desembarques.length > 0) {
  console.log('\n--- Primera fila ---');
  console.log(JSON.stringify(desembarques[0], null, 2));
  
  console.log('\n--- Columnas disponibles ---');
  console.log(Object.keys(desembarques[0]));
  
  console.log('\n--- Primeras 3 filas ---');
  desembarques.slice(0, 3).forEach((item, idx) => {
    console.log(`\nFila ${idx + 1}:`);
    console.log('  año:', item.año || item['año'] || item.AÑO);
    console.log('  region:', item.region || item.REGION);
    console.log('  especie:', item.especie || item.ESPECIE);
    console.log('  toneladas:', item.toneladas || item.TONELADAS);
    console.log('  mes:', item.mes || item.MES);
  });

  // Buscar años únicos
  const years = new Set();
  desembarques.slice(0, 1000).forEach(item => {
    const year = item.año || item['año'] || item.AÑO || item.ANO;
    if (year) years.add(year);
  });
  console.log('\n--- Años encontrados (muestra) ---');
  console.log(Array.from(years).sort());

  // Buscar regiones únicas
  const regions = new Set();
  desembarques.slice(0, 1000).forEach(item => {
    const region = item.region || item.REGION;
    if (region) regions.add(region);
  });
  console.log('\n--- Regiones encontradas (muestra) ---');
  console.log(Array.from(regions).sort());
}
