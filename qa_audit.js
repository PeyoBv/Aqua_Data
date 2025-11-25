const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('🚀 Iniciando Auditoría QA...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Ajustar viewport
    await page.setViewport({ width: 1280, height: 800 });

    const BASE_URL = 'http://localhost:3000';

    try {
        // ==========================================
        // PRUEBA 1: Auditoría del Selector de Especies
        // ==========================================
        console.log('\n🧪 PRUEBA 1: Auditoría del Selector de Especies (Aysén)');
        await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

        // Esperar a que cargue la app
        console.log('Esperando selector de región...');
        await page.waitForSelector('select', { timeout: 10000 });
        console.log('✅ Página cargada');

        // Buscar el select de región
        const selects = await page.$$('select');
        let regionSelectHandle = null;

        for (const sel of selects) {
            const html = await page.evaluate(el => el.innerHTML, sel);
            if (html.includes('Lagos') || html.includes('Aysén') || html.includes('Magallanes')) {
                regionSelectHandle = sel;
                break;
            }
        }

        if (regionSelectHandle) {
            await regionSelectHandle.select('AYSEN');
            console.log('✅ Región Aysén seleccionada');

            // Esperar actualización
            await new Promise(r => setTimeout(r, 2000));

            // Buscar el select de especies
            const speciesSelectHandle = await page.evaluateHandle(() => {
                const selects = Array.from(document.querySelectorAll('select'));
                return selects.find(s => s.innerHTML.includes('SALMÓN') || s.innerHTML.includes('MERLUZA') || s.innerHTML.includes('ALGAS') || s.innerHTML.includes('JIBIA'));
            });

            if (speciesSelectHandle && speciesSelectHandle.asElement()) {
                const speciesOptions = await page.evaluate(sel => {
                    return Array.from(sel.options).map(o => o.text);
                }, speciesSelectHandle);

                console.log(`📊 Total especies encontradas para Aysén: ${speciesOptions.length}`);

                if (speciesOptions.length > 50) {
                    console.error(`❌ FALLO: La lista tiene ${speciesOptions.length} especies. El filtro está sucio.`);
                    console.log('Ejemplos:', speciesOptions.slice(0, 10));
                } else {
                    console.log('✅ PASÓ: La lista de especies está limpia (<= 50).');
                }
            } else {
                console.warn('⚠️ No se encontró el selector de especies.');
                await page.screenshot({ path: 'debug_no_species_select.png' });
            }
        } else {
            console.warn('⚠️ No se encontró el selector de región.');
            await page.screenshot({ path: 'debug_no_region_select.png' });
        }

        // ==========================================
        // PRUEBA 2: Auditoría del Gráfico Histórico
        // ==========================================
        console.log('\n🧪 PRUEBA 2: Auditoría del Gráfico Histórico');

        // Ir a Comparador
        const links = await page.$$('a, button');
        let comparadorClicked = false;
        for (const link of links) {
            const text = await page.evaluate(el => el.innerText, link);
            if (text.includes('Comparador') || text.includes('Trazabilidad')) {
                await link.click();
                comparadorClicked = true;
                break;
            }
        }

        if (!comparadorClicked) {
            console.log('Intentando navegación directa a /comparador (si existe ruta)');
            // Si es SPA, tal vez no funcione direct navigation si no está configurado en server, pero probamos
        }

        await new Promise(r => setTimeout(r, 3000));

        // Seleccionar especie histórica
        const selectsComp = await page.$$('select');
        let compSpeciesSelect = null;
        for (const sel of selectsComp) {
            const html = await page.evaluate(el => el.innerHTML, sel);
            if (html.includes('MERLUZA') || html.includes('JIBIA') || html.includes('CALAMAR')) {
                compSpeciesSelect = sel;
                break;
            }
        }

        if (compSpeciesSelect) {
            const values = await page.evaluate(sel => Array.from(sel.options).map(o => o.value), compSpeciesSelect);
            const targetSpecies = values.find(v => v.includes('MERLUZA DE COLA')) || values.find(v => v.includes('MERLUZA')) || values[1];

            if (targetSpecies) {
                await compSpeciesSelect.select(targetSpecies);
                console.log(`✅ Especie seleccionada: ${targetSpecies}`);

                await new Promise(r => setTimeout(r, 3000));

                // Inspeccionar eje X
                try {
                    await page.waitForSelector('.recharts-cartesian-axis-tick-value', { timeout: 5000 });
                    const ticks = await page.$$eval('.recharts-cartesian-axis-tick-value tspan', els => els.map(e => e.innerHTML));
                    const years = ticks.filter(t => t.match(/^20\d\d$/)).map(t => parseInt(t)).sort();

                    if (years.length > 0) {
                        const minYear = years[0];
                        console.log(`📊 Rango de años detectado en gráfico: ${minYear} - ${years[years.length - 1]}`);

                        if (minYear > 2005) {
                            console.error(`❌ FALLO: El gráfico empieza en ${minYear}. Debería empezar cerca del 2000.`);
                        } else {
                            console.log('✅ PASÓ: El gráfico muestra historia antigua.');
                        }
                    } else {
                        console.warn('⚠️ No se detectaron años en el eje X.');
                        await page.screenshot({ path: 'debug_chart_no_years.png' });
                    }
                } catch (e) {
                    console.warn('⚠️ No se encontró el gráfico o los ticks.');
                    await page.screenshot({ path: 'debug_no_chart.png' });
                }
            }
        } else {
            console.warn('⚠️ No se encontró selector de especie en Comparador.');
            await page.screenshot({ path: 'debug_no_comp_species.png' });
        }

    } catch (error) {
        console.error('❌ Error fatal en la prueba:', error);
        await page.screenshot({ path: 'debug_fatal_error.png' });
    } finally {
        await browser.close();
    }
})();
