const CosechaService = require('./src/services/cosechaService');
const DataLoaderService = require('./src/services/dataLoaderService');
const dataStore = require('./src/data/dataStore');

async function testCosechaService() {
  try {
    console.log('\n🧪 TEST DEL SERVICIO DE COSECHAS\n');
    
    // Cargar datos
    console.log('Cargando datos...');
    const data = await DataLoaderService.loadAllData();
    dataStore.initializeData(data);
    
    console.log('\n=== TEST 1: Sin filtros ===');
    const result1 = CosechaService.calcularCosechas({});
    console.log('Success:', result1.success);
    console.log('KPIs:', result1.kpis);
    console.log('Gráfico mensual (primeros 3):', result1.grafico_mensual.slice(0, 3));
    console.log('Gráfico especies (top 5):', result1.grafico_especies.slice(0, 5));
    
    console.log('\n=== TEST 2: Filtro por año 2000 ===');
    const result2 = CosechaService.calcularCosechas({ anio: 2000 });
    console.log('Success:', result2.success);
    console.log('Filtros aplicados:', result2.filters);
    console.log('KPIs:', result2.kpis);
    console.log('Gráfico especies (top 5):', result2.grafico_especies.slice(0, 5));
    
    console.log('\n=== TEST 3: Filtro por región TARAPACÁ ===');
    const result3 = CosechaService.calcularCosechas({ region: 'Tarapacá' });
    console.log('Success:', result3.success);
    console.log('Filtros aplicados:', result3.filters);
    console.log('KPIs:', result3.kpis);
    
    console.log('\n=== TEST 4: Filtro por especie ANCHOVETA ===');
    const result4 = CosechaService.calcularCosechas({ especie: 'Anchoveta' });
    console.log('Success:', result4.success);
    console.log('Filtros aplicados:', result4.filters);
    console.log('KPIs:', result4.kpis);
    
    console.log('\n=== TEST 5: Filtros combinados (año 2000 + región Tarapacá) ===');
    const result5 = CosechaService.calcularCosechas({ anio: 2000, region: 'Tarapacá' });
    console.log('Success:', result5.success);
    console.log('Filtros aplicados:', result5.filters);
    console.log('KPIs:', result5.kpis);
    console.log('Gráfico mensual:', result5.grafico_mensual);
    
    console.log('\n✅ TODOS LOS TESTS COMPLETADOS\n');
    
  } catch (error) {
    console.error('❌ Error en tests:', error);
  }
}

testCosechaService();
