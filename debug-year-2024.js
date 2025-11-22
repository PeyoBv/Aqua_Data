const DataLoaderService = require('./src/services/dataLoaderService');

async function debugYear2024() {
    try {
        console.log('🚀 Debugging Year 2024...');

        const data = await DataLoaderService.loadAllData();
        const { desembarques } = data;

        const records2024 = desembarques.filter(row => parseInt(row.año) === 2024);
        console.log(`📅 Total registros en 2024: ${records2024.length}`);

        if (records2024.length > 0) {
            console.log('🔍 Primeros 5 registros de 2024:');
            console.table(records2024.slice(0, 5).map(r => ({
                especie: r.especie,
                region: r.region,
                toneladas: r.toneladas
            })));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugYear2024();
