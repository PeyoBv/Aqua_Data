const dataStore = require('./src/data/dataStore');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Mock loading data since we can't run the full server startup
function loadData(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: ';' })) // Assuming semicolon separator based on region context
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

async function verify() {
    try {
        console.log('Loading data...');
        const desembarques = await loadData(path.join(__dirname, 'Base de Datos', 'BD_desembarque', 'BD_desembarque.csv'));
        const produccion = await loadData(path.join(__dirname, 'Base de Datos', 'BD_materia_prima_produccion', 'BD_materia_prima_produccion.csv'));

        dataStore.setDesembarques(desembarques);
        dataStore.setMateriaPrimaProduccion(produccion);

        console.log('Data loaded.');

        // 1. Verify 0-ton filter
        console.log('Verifying 0-ton filter...');
        const allSpecies = dataStore.getUniqueSpecies();
        let zeroTonSpeciesFound = false;

        // Calculate manually to check
        const speciesMap = {};
        desembarques.forEach(d => {
            if (d.especie) {
                const tons = parseFloat(d.toneladas) || 0;
                speciesMap[d.especie] = (speciesMap[d.especie] || 0) + tons;
            }
        });

        allSpecies.forEach(species => {
            if (speciesMap[species] <= 0) {
                console.error(`❌ Found species with 0 tons in list: ${species}`);
                zeroTonSpeciesFound = true;
            }
        });

        if (!zeroTonSpeciesFound) {
            console.log('✅ No species with 0 tons found in the filtered list.');
        }

        // 2. Find species with data before 2010
        console.log('Finding species with data before 2010...');

        if (desembarques.length > 0) {
            console.log('First row keys:', Object.keys(desembarques[0]));
        }

        const speciesPre2010 = new Set();
        let minYear = 2024;

        // Find the key for year
        const sampleRow = desembarques[0] || {};
        const yearKey = Object.keys(sampleRow).find(k => k.includes('a') && k.includes('o') && k.length < 5) || 'año';
        console.log(`Using year key: "${yearKey}"`);

        desembarques.forEach(d => {
            const year = parseInt(d[yearKey]);
            if (!isNaN(year)) {
                if (year < minYear) minYear = year;

                if (year < 2010 && parseFloat(d.toneladas) > 0) {
                    speciesPre2010.add(d.especie);
                }
            }
        });

        console.log(`ℹ️ Earliest year in dataset: ${minYear}`);

        const speciesListPre2010 = Array.from(speciesPre2010);
        if (speciesListPre2010.length > 0) {
            console.log(`✅ Found ${speciesListPre2010.length} species with data before 2010.`);
            console.log('Examples:', speciesListPre2010.slice(0, 5));
        } else {
            console.warn('⚠️ No species found with data before 2010.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verify();
