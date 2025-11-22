const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarRegion } = require('./src/utils/normalizar');

async function debug2024LosLagos() {
    try {
        console.log('🚀 Debugging 2024 - Los Lagos...');

        const data = await DataLoaderService.loadAllData();
        const { desembarques } = data;

        const records = desembarques.filter(row => {
            return parseInt(row.año) === 2024 && normalizarRegion(row.region) === 'LAGOS';
        });

        console.log(`📅 Total registros 2024 en Los Lagos: ${records.length}`);

        // Agrupar por especie
        const especies = {};
        records.forEach(row => {
            const sp = row.especie;
            especies[sp] = (especies[sp] || 0) + (parseFloat(row.toneladas) || 0);
        });

        console.table(Object.entries(especies).map(([especie, total]) => ({
            especie,
            total: total.toFixed(2)
        })).sort((a, b) => b.total - a.total));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debug2024LosLagos();
