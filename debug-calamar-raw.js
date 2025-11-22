const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarTexto } = require('./src/utils/normalizar');
const path = require('path');
const config = require('./src/config');

async function debugCalamarRaw() {
    try {
        console.log('🚀 Debugging CALAMAR data (WITHOUT REGIONAL FILTER)...');

        // Cargar manualmente sin filtro regional
        const basePath = path.join(config.csvBasePath);
        const desembarques = await DataLoaderService.loadCsvFileFromPath(
            path.join(basePath, 'BD_desembarque', 'BD_desembarque.csv'),
            DataLoaderService.normalizeDesembarque,
            false // <--- DISABLE REGIONAL FILTER
        );

        console.log(`📦 Total desembarques cargados: ${desembarques.length}`);

        const calamarData = desembarques.filter(row => normalizarTexto(row.especie) === 'CALAMAR');
        console.log(`📊 Registros de 'CALAMAR': ${calamarData.length}`);

        const calamar2024 = calamarData.filter(row => parseInt(row.año) === 2024);
        console.log(`📅 Registros en 2024: ${calamar2024.length}`);

        if (calamar2024.length > 0) {
            console.table(calamar2024.map(r => ({
                id: r.id,
                año: r.año,
                region_raw: r.region, // Ver el valor original
                toneladas: r.toneladas
            })));
        } else {
            console.log("⚠️ No se encontraron registros para 2024 incluso sin filtro regional.");
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCalamarRaw();
