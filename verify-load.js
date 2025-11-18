const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizeText } = require('./src/utils/dataHelpers');

async function verify() {
  try {
    console.log('\n🔍 VERIFICANDO DATOS CARGADOS...\n');
    
    const data = await DataLoaderService.loadAllData();
    const desembarques = data.desembarques;
    
    console.log('Total registros desembarques:', desembarques.length);
    
    if (desembarques.length > 0) {
      const firstItem = desembarques[0];
      
      console.log('\n--- COLUMNAS DISPONIBLES ---');
      console.log(Object.keys(firstItem));
      
      console.log('\n--- PRIMER REGISTRO (raw) ---');
      console.log(JSON.stringify(firstItem, null, 2));
      
      console.log('\n--- ANÁLISIS DE COLUMNA AÑO ---');
      const añoKeys = Object.keys(firstItem).filter(k => k.toLowerCase().includes('a') && k.toLowerCase().includes('o'));
      console.log('Columnas que contienen "a" y "o":', añoKeys);
      añoKeys.forEach(key => {
        console.log(`  ${key}: "${firstItem[key]}"`);
      });
      
      console.log('\n--- TEST: Búsqueda año 2020 ---');
      let found2020 = 0;
      for (let i = 0; i < Math.min(1000, desembarques.length); i++) {
        const item = desembarques[i];
        // Buscar en todas las claves posibles
        for (const key of Object.keys(item)) {
          if (parseInt(item[key]) === 2020) {
            found2020++;
            if (found2020 === 1) {
              console.log(`Encontrado en clave "${key}":`, item[key]);
              console.log('Registro completo:', JSON.stringify(item, null, 2));
            }
            break;
          }
        }
      }
      console.log(`Total registros con 2020 en primeros 1000: ${found2020}`);
      
      console.log('\n--- TEST: Total de toneladas ---');
      let totalTons = 0;
      desembarques.slice(0, 100).forEach(item => {
        const tons = parseFloat(item.toneladas || item.TONELADAS || 0);
        totalTons += tons;
      });
      console.log(`Total toneladas (primeros 100 registros): ${totalTons.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verify();
