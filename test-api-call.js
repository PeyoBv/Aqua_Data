const DataLoaderService = require('./src/services/dataLoaderService');
const ComparadorService = require('./src/services/comparadorService');
const dataStore = require('./src/data/dataStore');

async function testApiCall() {
    try {
        console.log('🚀 Testing API Call Simulation...');

        // 1. Cargar datos
        const data = await DataLoaderService.loadAllData();
        dataStore.initializeData(data);

        // 2. Simular llamada
        console.log("\n📞 Llamando a ComparadorService.obtenerComparacionRegional('CALAMAR', 2024, 'LAGOS')...");
        const result = ComparadorService.obtenerComparacionRegional('CALAMAR', 2024, 'LAGOS');

        console.log('\n📦 Resultado API:');
        console.log(JSON.stringify(result, null, 2));

        // 3. Simular llamada sin filtro regional (para ver si aparece algo)
        console.log("\n📞 Llamando a ComparadorService.obtenerComparacionRegional('CALAMAR', 2024, 'TODAS')...");
        const resultTodas = ComparadorService.obtenerComparacionRegional('CALAMAR', 2024, 'TODAS');
        console.log(JSON.stringify(resultTodas, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testApiCall();
