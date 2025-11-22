const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarTexto } = require('./src/utils/normalizar');

async function debugJibiaAnd8Ton() {
    try {
        console.log('🚀 Debugging Jibia and 8-ton matches...');

        const data = await DataLoaderService.loadAllData();
        const { desembarques } = data;

        // 1. Check JIBIA O CALAMAR ROJO in 2024
        const jibia2024 = desembarques.filter(row =>
            normalizarTexto(row.especie) === 'JIBIA O CALAMAR ROJO' &&
            parseInt(row.año) === 2024
        );
        console.log(`🦑 JIBIA O CALAMAR ROJO en 2024: ${jibia2024.length} registros`);

        // 2. Check ANY species with ~8 tons in 2024 (Los Lagos)
        const records2024 = desembarques.filter(row => parseInt(row.año) === 2024);

        console.log('\n🔍 Buscando registros con ~8 toneladas en 2024:');
        records2024.forEach(row => {
            const ton = parseFloat(row.toneladas) || 0;
            if (ton > 7.5 && ton < 8.5) {
                console.log(`🎯 MATCH: ${row.especie} (${row.region}): ${ton} ton`);
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugJibiaAnd8Ton();
