const DataLoaderService = require('./src/services/dataLoaderService');
const ComparadorService = require('./src/services/comparadorService');
const { normalizarRegion, normalizarTexto } = require('./src/utils/normalizar');
const dataStore = require('./src/data/dataStore');
const fs = require('fs');

const LOG_FILE = 'audit_e2e_results.log';

function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
}

async function runE2EAudit() {
    fs.writeFileSync(LOG_FILE, '', 'utf8');
    log('🤖 INICIANDO AUDITORÍA E2E (SIMULACIÓN DE USUARIO) 🤖\n');
    log('| ID | Región | Año | Especie | CSV (Ton) | API/Gráfico (Ton) | Estado |');
    log('|---|---|---|---|---|---|---|');

    try {
        // 1. Carga de Datos
        const data = await DataLoaderService.loadAllData();
        dataStore.initializeData(data);
        const { desembarques } = data;

        const regions = ['LAGOS', 'AYSEN', 'MAGALLANES'];
        const years = [2010, 2018, 2024];

        let testId = 1;

        for (const region of regions) {
            for (const year of years) {
                // Filtrar datos base para esta región/año para elegir especies válidas
                const dataContext = desembarques.filter(d =>
                    normalizarRegion(d.region) === region &&
                    parseInt(d.año) === year
                );

                if (dataContext.length === 0) {
                    log(`| ${testId++} | ${region} | ${year} | N/A (Sin datos) | 0 | 0 | ⚠️ SKIP |`);
                    continue;
                }

                // Agrupar por especie para encontrar High/Low volume
                const speciesMap = {};
                dataContext.forEach(d => {
                    const sp = normalizarTexto(d.especie);
                    const tons = parseFloat(d.toneladas) || 0;
                    speciesMap[sp] = (speciesMap[sp] || 0) + tons;
                });

                const sortedSpecies = Object.entries(speciesMap).sort((a, b) => b[1] - a[1]);

                if (sortedSpecies.length === 0) continue;

                // Seleccionar High Volume (Top 1) y Low Volume (Last 1 or specific)
                const highVol = sortedSpecies[0];
                const lowVol = sortedSpecies[sortedSpecies.length - 1];

                const speciesToTest = [highVol];
                if (lowVol && lowVol[0] !== highVol[0]) {
                    speciesToTest.push(lowVol);
                }

                for (const [speciesName, csvTotal] of speciesToTest) {
                    // Simular llamada a API (ComparadorService)
                    // Nota: ComparadorService.obtenerComparacionRegional devuelve datos agrupados.
                    // Para validar el total exacto, sumamos la respuesta de la API.

                    const apiResponse = await ComparadorService.obtenerComparacionRegional({
                        especie: speciesName,
                        year: year,
                        region: region
                    });

                    let apiTotal = 0;
                    if (apiResponse.success && apiResponse.data) {
                        apiTotal = apiResponse.data.reduce((sum, item) => sum + item.captura, 0);
                    }

                    // Validación Matemática
                    // Tolerancia pequeña por redondeo de punto flotante
                    const diff = Math.abs(csvTotal - apiTotal);
                    const status = diff < 0.1 ? '✅ PASS' : `❌ FAIL (Diff: ${diff.toFixed(2)})`;

                    log(`| ${testId++} | ${region} | ${year} | ${speciesName} | ${csvTotal.toFixed(2)} | ${apiTotal.toFixed(2)} | ${status} |`);
                }
            }
        }

        // 2. Validación de Lógica "Regional Balance" (OTHERS bar)
        log('\n🧪 2. Validación Lógica Regional Balance (OTHERS)');
        // Caso: Magallanes (Región Única) -> No debería haber "OTRAS"
        const magallanesBalance = await ComparadorService.obtenerComparacionRegional({
            especie: 'CENTOLLA',
            year: 'TODOS',
            region: 'MAGALLANES'
        });

        if (magallanesBalance.success) {
            const hasOthers = magallanesBalance.data.some(d => d.name === 'OTRAS');
            log(`- Filtro Magallanes (Región Única): ¿Tiene barra 'OTRAS'? ${hasOthers ? '❌ FAIL' : '✅ PASS'}`);
        }

        // Caso: Todas (Global) -> Debería haber "OTRAS" si hay muchas regiones
        const globalBalance = await ComparadorService.obtenerComparacionRegional({
            especie: 'LUGA ROJA',
            year: 'TODOS',
            region: 'TODAS'
        });

        if (globalBalance.success) {
            const hasOthers = globalBalance.data.some(d => d.name === 'OTRAS');
            const regionCount = globalBalance.data.length;
            log(`- Filtro Global (Todas): ¿Tiene barra 'OTRAS'? ${hasOthers ? '✅ PASS' : '⚠️ INFO (Solo ' + regionCount + ' regiones)'}`);
        }

    } catch (error) {
        log(`❌ ERROR FATAL: ${error.message}`);
    }
}

runE2EAudit();
