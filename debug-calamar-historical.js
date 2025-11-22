const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarRegion, normalizarTexto } = require('./src/utils/normalizar');

async function debugCalamarHistorical() {
    try {
        console.log('🚀 Debugging CALAMAR Historical Total (Los Lagos)...');

        const data = await DataLoaderService.loadAllData();
        const { desembarques } = data;

        const calamarLagos = desembarques.filter(row => {
            return normalizarTexto(row.especie) === 'CALAMAR' &&
                normalizarRegion(row.region) === 'LAGOS';
        });

        console.log(`📦 Total registros históricos: ${calamarLagos.length}`);

        const totalTon = calamarLagos.reduce((sum, row) => sum + (parseFloat(row.toneladas) || 0), 0);

        console.log(`🎣 Total Captura Histórica (2010-2024): ${totalTon.toFixed(2)} ton`);

        if (calamarLagos.length > 0) {
            console.log('\n🔍 Desglose por año:');
            const porAnio = {};
            calamarLagos.forEach(row => {
                const anio = row.año;
                porAnio[anio] = (porAnio[anio] || 0) + (parseFloat(row.toneladas) || 0);
            });
            console.table(porAnio);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCalamarHistorical();
