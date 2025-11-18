const dataStore = require('./src/data/dataStore');
const { normalizeText } = require('./src/utils/dataHelpers');

// Esperar a que los datos se carguen
setTimeout(() => {
  const desembarques = dataStore.getDesembarques();
  
  console.log('\n=== VERIFICACIÓN DE DATOS CARGADOS ===\n');
  console.log('Total registros:', desembarques.length);
  
  if (desembarques.length > 0) {
    const firstItem = desembarques[0];
    
    console.log('\n--- Columnas del primer registro ---');
    console.log(Object.keys(firstItem));
    
    console.log('\n--- Valores del primer registro ---');
    console.log(JSON.stringify(firstItem, null, 2));
    
    console.log('\n--- Búsqueda de año 2020 ---');
    const registros2020 = desembarques.filter(item => {
      // Intentar diferentes formas de acceder al año
      const year = item.año || item.AÑO || item.ano || item.ANO || item.anio || item.ANIO;
      return parseInt(year) === 2020;
    });
    console.log('Registros encontrados con año 2020:', registros2020.length);
    
    if (registros2020.length > 0) {
      console.log('\nPrimer registro de 2020:');
      console.log(JSON.stringify(registros2020[0], null, 2));
    }
    
    console.log('\n--- Búsqueda de región Tarapacá ---');
    const registrosTarapaca = desembarques.filter(item => {
      const region = normalizeText(item.region || item.REGION || '');
      return region === 'TARAPACÁ' || region === 'TARAPACA';
    });
    console.log('Registros encontrados con región Tarapacá:', registrosTarapaca.length);
    
    if (registrosTarapaca.length > 0) {
      console.log('\nPrimer registro de Tarapacá:');
      console.log(JSON.stringify(registrosTarapaca[0], null, 2));
    }
    
    // Sumar todas las toneladas para verificar
    let totalToneladas = 0;
    desembarques.forEach(item => {
      const ton = parseFloat(item.toneladas || item.TONELADAS || 0);
      totalToneladas += ton;
    });
    console.log('\n--- Total de toneladas en todos los registros ---');
    console.log('Total:', totalToneladas.toFixed(2), 'toneladas');
  }
  
  process.exit(0);
}, 1000);
