const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarTexto } = require('./src/utils/normalizar');

async function debugCalamar() {
    try {
        console.log('🚀 Debugging CALAMAR data...');

        const data = await DataLoaderService.loadAllData();
        const { desembarques } = data;

        // 1. Buscar variantes de nombre
        const especies = new Set();
        desembarques.forEach(row => {
            const nombre = normalizarTexto(row.especie);
            if (nombre.includes('CALAMAR')) {
                especies.add(nombre);
            }
        });

        console.log('\n🦑 Variantes de CALAMAR encontradas:', Array.from(especies));

        // 2. Ver datos para 'CALAMAR' exacto
        const calamarData = desembarques.filter(row => normalizarTexto(row.especie) === 'CALAMAR');
        console.log(`\n📊 Registros exactos de 'CALAMAR': ${calamarData.length}`);

        // 3. Ver años disponibles para 'CALAMAR'
        const anios = new Set(calamarData.map(row => row.año));
        console.log('📅 Años disponibles:', Array.from(anios).sort());

        // 4. Ver regiones para 'CALAMAR' en 2024
        const calamar2024 = calamarData.filter(row => parseInt(row.año) === 2024);
        console.log(`\n📅 Registros en 2024: ${calamar2024.length}`);

        if (calamar2024.length > 0) {
            console.table(calamar2024.map(r => ({
                region: r.region,
                toneladas: r.toneladas
            })));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCalamar();
