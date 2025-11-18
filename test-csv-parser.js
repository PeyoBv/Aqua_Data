// Script para probar el parser CSV
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const filePath = path.join(__dirname, 'Base de Datos', 'BD_desembarque', 'BD_desembarque.csv');

console.log('\n=== PRUEBA DE LECTURA CSV ===\n');
console.log('Archivo:', filePath);

let count = 0;
const results = [];

fs.createReadStream(filePath)
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => {
    if (count < 3) {
      results.push(data);
    }
    count++;
  })
  .on('end', () => {
    console.log('\nTotal de registros procesados:', count);
    
    if (results.length > 0) {
      console.log('\n--- Columnas encontradas ---');
      console.log(Object.keys(results[0]));
      
      console.log('\n--- Primeras 3 filas ---');
      results.forEach((row, idx) => {
        console.log(`\nFila ${idx + 1}:`);
        console.log(JSON.stringify(row, null, 2));
      });
    }
  })
  .on('error', (error) => {
    console.error('Error:', error);
  });
