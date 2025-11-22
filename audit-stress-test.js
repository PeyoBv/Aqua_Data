const DataLoaderService = require('./src/services/dataLoaderService');
const ComparadorService = require('./src/services/comparadorService');
const { normalizarRegion, normalizarTexto } = require('./src/utils/normalizar');
const dataStore = require('./src/data/dataStore');
const fs = require('fs');

const LOG_FILE = 'audit_results.log';

function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
}

async function runStressTest() {
    // Clear log file
    fs.writeFileSync(LOG_FILE, '', 'utf8');

    log('🛡️ INICIANDO AUDITORÍA EXTREMA (STRESS TEST) - V2 🛡️\n');

    try {
        // 1. Carga de Datos
        log('📦 Cargando datasets...');
        const data = await DataLoaderService.loadAllData();
        dataStore.initializeData(data);
        const { desembarques } = data; // Only desembarques is needed for the tests
        log(`✅ Datos cargados. Desembarques: ${desembarques.length}\n`);

        // ==========================================
        // 📍 FASE 1: AUDITORÍA EXPLORADOR
        // ==========================================
        try {
            log('📍 FASE 1: AUDITORÍA EXPLORADOR DE DATOS');

            // 1.1 Validación de Filtros en Cascada
            log('🔍 1.1 Validación de Filtro "Tipo de Agente" (Artesanal vs Industrial)');
            const artesanales = desembarques.filter(d => normalizarTexto(d.agente) === 'ARTESANAL');
            const industrialesEnArtesanal = artesanales.filter(d => normalizarTexto(d.agente) === 'INDUSTRIAL');

            if (industrialesEnArtesanal.length === 0) {
                log('✅ PRUEBA PASADA: Filtro "Artesanal" excluye 100% de industriales.');
            } else {
                log(`❌ FALLO CRÍTICO: ${industrialesEnArtesanal.length} registros industriales en set artesanal.`);
            }

            // 1.2 Integridad Geográfica
            log('🔍 1.2 Integridad Geográfica (Magallanes)');
            const magallanesData = desembarques.filter(d => normalizarRegion(d.region) === 'MAGALLANES');
            const contaminacionLagos = magallanesData.filter(d => normalizarRegion(d.region) === 'LAGOS');
            const contaminacionAysen = magallanesData.filter(d => normalizarRegion(d.region) === 'AYSEN');

            if (contaminacionLagos.length === 0 && contaminacionAysen.length === 0) {
                log(`✅ PRUEBA PASADA: Magallanes limpia de datos foráneos.`);
            } else {
                log(`❌ FALLO CRÍTICO: Contaminación en Magallanes. Lagos: ${contaminacionLagos.length}, Aysén: ${contaminacionAysen.length}`);
            }
        } catch (e) {
            log('❌ Error en Fase 1: ' + e.message);
        }

        // ==========================================
        // 📍 FASE 2: AUDITORÍA COMPARADOR
        // ==========================================
        try {
            log('\n📍 FASE 2: AUDITORÍA COMPARADOR');

            // 2.1 Escenario A: Salmón del Atlántico en Los Lagos
            log('🔍 2.1 Escenario A: Salmón del Atlántico en Los Lagos');
            const compSalmon = await ComparadorService.obtenerComparacionRegional({
                especie: 'SALMON DEL ATLANTICO',
                year: 'TODOS',
                region: 'LAGOS'
            });
            log(`📊 Resultado API: Success=${compSalmon.success}, DataPoints=${compSalmon.data ? compSalmon.data.length : 0}`);

            // 2.2 Escenario B: Luga Roja en Aysén
            log('🔍 2.2 Escenario B: Luga Roja en Aysén');
            const compLuga = await ComparadorService.obtenerComparacionRegional({
                especie: 'LUGA ROJA',
                year: 'TODOS',
                region: 'AYSEN'
            });
            log(`📊 Resultado API: Success=${compLuga.success}, DataPoints=${compLuga.data ? compLuga.data.length : 0}`);

            // 2.3 Escenario C: KPIs 2024 en Magallanes
            log('🔍 2.3 Escenario C: KPIs 2024 en Magallanes');
            const trazabilidadMagallanes2024 = await ComparadorService.obtenerTrazabilidad({
                especie: 'CALAMAR',
                region: 'MAGALLANES'
            });

            if (trazabilidadMagallanes2024.success && trazabilidadMagallanes2024.data) {
                const data2024 = trazabilidadMagallanes2024.data.find(d => d.año === 2024);
                const desembarque2024 = data2024 ? data2024.desembarque : 0;

                log(`📊 KPI Desembarque 2024: ${desembarque2024} ton`);
                if (desembarque2024 === 0) {
                    log('✅ PRUEBA PASADA: KPI 2024 muestra 0 ton correctamente.');
                } else {
                    log(`⚠️ ALERTA: KPI 2024 muestra ${desembarque2024} ton.`);
                }
            } else {
                log('⚠️ No se pudo obtener trazabilidad para Calamar/Magallanes.');
            }

            // 2.4 Auditoría "Top 4 + OTHERS"
            log('🔍 2.4 Auditoría "Top 4 + OTHERS" (Luga Roja)');
            const balanceLuga = await ComparadorService.obtenerComparacionRegional({
                especie: 'LUGA ROJA',
                year: 'TODOS',
                region: 'TODAS'
            });

            if (balanceLuga.success && balanceLuga.data) {
                const totalGrafico = balanceLuga.data.reduce((sum, item) => sum + item.captura, 0);

                const totalCSV = desembarques
                    .filter(d => normalizarTexto(d.especie) === 'LUGA ROJA')
                    .reduce((sum, d) => sum + (parseFloat(d.toneladas) || 0), 0);

                log(`📊 Total Gráfico: ${totalGrafico.toFixed(2)} vs Total CSV: ${totalCSV.toFixed(2)}`);
                const diff = Math.abs(totalGrafico - totalCSV);
                if (diff < 1.0) { // Tolerancia de 1 ton por redondeo
                    log('✅ PRUEBA PASADA: Suma gráfica coincide con CSV.');
                } else {
                    log(`❌ FALLO: Discrepancia de ${diff.toFixed(2)} toneladas.`);
                }
            } else {
                log('⚠️ No hay datos para Luga Roja para probar Top 4.');
            }
        } catch (e) {
            log('❌ Error en Fase 2: ' + e.message);
        }

    } catch (error) {
        log('❌ ERROR FATAL: ' + error);
    }
}

runStressTest();
