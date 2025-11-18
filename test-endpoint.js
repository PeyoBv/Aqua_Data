// Test rápido del endpoint
const http = require('http');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\n=== ${description} ===`);
          console.log('Success:', json.success);
          if (json.filters) console.log('Filtros:', json.filters);
          if (json.kpis) {
            console.log('KPIs:');
            console.log('  - Cosecha Total:', json.kpis.cosechaTotal, 'toneladas');
            console.log('  - Meses con datos:', json.kpis.mesesConDatos);
            console.log('  - Especies detectadas:', json.kpis.especiesDetectadas);
          }
          if (json.grafico_mensual && json.grafico_mensual.length > 0) {
            console.log(`\nGráfico Mensual (primeros 3):`);
            json.grafico_mensual.slice(0, 3).forEach(item => {
              console.log(`  Mes ${item.mes}: ${item.toneladas} tons`);
            });
          }
          if (json.grafico_especies && json.grafico_especies.length > 0) {
            console.log(`\nGráfico Especies (top 5):`);
            json.grafico_especies.slice(0, 5).forEach(item => {
              console.log(`  ${item.especie}: ${item.toneladas} tons`);
            });
          }
          resolve();
        } catch (e) {
          console.error('Error parsing JSON:', e);
          resolve();
        }
      });
    }).on('error', (e) => {
      console.error(`Error: ${e.message}`);
      resolve();
    });
  });
}

async function runTests() {
  console.log('\n🧪 PRUEBAS DE ENDPOINT /api/v1/cosechas\n');
  
  await testEndpoint('http://localhost:3000/api/v1/cosechas?anio=2020', 
    'Test 1: Filtro por año 2020');
  
  await testEndpoint('http://localhost:3000/api/v1/cosechas?region=Tarapacá', 
    'Test 2: Filtro por región Tarapacá');
  
  await testEndpoint('http://localhost:3000/api/v1/cosechas?anio=2020&region=Tarapacá', 
    'Test 3: Filtro por año 2020 y región Tarapacá');
  
  console.log('\n✅ Pruebas completadas\n');
}

// Esperar 2 segundos para que el servidor esté listo
setTimeout(runTests, 2000);
