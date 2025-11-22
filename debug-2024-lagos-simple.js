const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarRegion } = require('./src/utils/normalizar');

async function debug2024LosLagosSimple() {
    try {
        console.log('🚀 Debugging 2024 - Los Lagos (Simple)...');

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

        const sorted = Object.entries(especies)
            .map(([especie, total]) => ({ especie, total }))
            .sort((a, b) => b.total - a.total);

        console.log('⬇️ TOP 20 ESPECIES 2024 (LOS LAGOS):');
        sorted.slice(0, 20).forEach(item => {
            console.log(`${item.especie}: ${item.total.toFixed(2)} ton`);
        });

        // Buscar específicamente algo cercano a 8
        console.log('\n🔍 Buscando valores cercanos a 8 ton:');
        sorted.forEach(item => {
            if (item.total > 7 && item.total < 9) {
                console.log(`🎯 MATCH: ${item.especie}: ${item.total.toFixed(2)} ton`);
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debug2024LosLagosSimple();
