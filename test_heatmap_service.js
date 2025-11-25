const ComparadorService = require('./src/services/comparadorService');
const dataStore = require('./src/data/dataStore');

// Mock dataStore
dataStore.getDesembarques = () => [
    { especie: 'TEST', año: '2000', mes: '1', toneladas: '10' },
    { especie: 'TEST', año: '2024', mes: '12', toneladas: '20' }
];

async function test() {
    console.log('Testing obtenerMatrizEstacionalidad...');
    const result = ComparadorService.obtenerMatrizEstacionalidad('TEST', 'TODAS');

    if (!result.success) {
        console.error('❌ Service failed:', result.error);
        return;
    }

    console.log('Years returned:', result.years);

    const expectedYears = [];
    for (let y = 2024; y >= 2000; y--) expectedYears.push(y);

    const missing = expectedYears.filter(y => !result.years.includes(y));

    if (missing.length === 0 && result.years.length === 25) {
        console.log('✅ All years 2000-2024 are present.');
    } else {
        console.error('❌ Missing years:', missing);
        console.error('Returned length:', result.years.length);
    }

    // Check data structure for a missing year (e.g. 2010)
    const data2010 = result.data.find(d => d.year === 2010);
    if (data2010 && data2010.months.length === 12) {
        console.log('✅ Year 2010 (no data) has correct structure with 12 months.');
    } else {
        console.error('❌ Year 2010 structure is incorrect:', data2010);
    }
}

test();
