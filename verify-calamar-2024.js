const DataLoaderService = require('./src/services/dataLoaderService');
const { normalizarTexto, normalizarRegion } = require('./src/utils/normalizar');

async function verifyCalamar2024() {
    try {
        console.log('🚀 Iniciando verificación de datos para CALAMAR - 2024 - LOS LAGOS...');

        // Cargar datos
        const data = await DataLoaderService.loadAllData();
        const { desembarques, materiaPrimaProduccion } = data;

        const ESPECIE = 'CALAMAR';
        const ANIO = 2024;
        const REGION_OBJETIVO = 'LAGOS'; // Normalizado

        console.log(`\n📊 Analizando Desembarques (Captura)...`);

        const desembarquesFiltrados = desembarques.filter(row => {
            const isEspecie = normalizarTexto(row.especie) === ESPECIE;
            const isAnio = parseInt(row.año) === ANIO;
            const regionNorm = normalizarRegion(row.region);
            const isRegion = regionNorm === REGION_OBJETIVO;

            if (isEspecie && isAnio) {
                // Log para ver qué regiones hay en 2024 para Calamar
                // console.log(`  - Encontrado: ${row.region} -> ${regionNorm} (${row.toneladas} ton)`);
            }

            return isEspecie && isAnio && isRegion;
        });

        const totalCaptura = desembarquesFiltrados.reduce((sum, row) => sum + (parseFloat(row.toneladas) || 0), 0);

        console.log(`\n📊 Analizando Producción (Materia Prima)...`);

        const produccionFiltrada = materiaPrimaProduccion.filter(row => {
            const isEspecie = normalizarTexto(row.especie) === ESPECIE;
            const isAnio = parseInt(row.año) === ANIO;
            const regionNorm = normalizarRegion(row.region);
            const isRegion = regionNorm === REGION_OBJETIVO;

            return isEspecie && isAnio && isRegion;
        });

        const totalProcesamiento = produccionFiltrada.reduce((sum, row) => sum + (parseFloat(row.toneladas_mp) || 0), 0);

        console.log('\n==========================================');
        console.log('RESULTADOS DE VERIFICACIÓN:');
        console.log('==========================================');
        console.log(`Especie: ${ESPECIE}`);
        console.log(`Año: ${ANIO}`);
        console.log(`Región: ${REGION_OBJETIVO} (Los Lagos)`);
        console.log('------------------------------------------');
        console.log(`🎣 Total Captura (CSV):      ${totalCaptura.toFixed(2)} ton`);
        console.log(`🏭 Total Procesamiento (CSV): ${totalProcesamiento.toFixed(2)} ton`);
        console.log('==========================================');

        console.log('\n🔍 Detalle de registros de Captura:');
        console.table(desembarquesFiltrados.map(r => ({
            id: r.id,
            mes: r.mes,
            region: r.region,
            toneladas: r.toneladas
        })));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyCalamar2024();
