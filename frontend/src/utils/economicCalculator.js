import preciosReferencia from '../../public/data/precios_referencia.json';

// Cache prices to avoid reloading if we were fetching, but here it's a direct import (or we can fetch it)
// Since it's in public/data, we might need to fetch it or import it if it was in src.
// The user instruction said "Create a file in frontend/public/data/precios_referencia.json".
// Importing from public in Vite works if we treat it as a static asset or if we move it to src.
// To make it easier to import synchronously in a helper without async fetch, let's assume we can import it if we move it to src or just duplicate/hardcode for now?
// Actually, the user said "Create a file in frontend/public/data/precios_referencia.json".
// If I want to import it in a JS file, I can't easily do `import ... from '../../public/...'` in Vite production build usually, it expects it in src.
// BUT, I can fetch it. However, `calculateValue` needs to be synchronous for charts usually.
// STRATEGY: I will create the file in `public/data` as requested, AND I will also create a local object in this file as a fallback/initial state, OR I will fetch it once in App.jsx and pass it down?
// The user said "Logic Business (Helper)... Create src/utils/economicCalculator.js".
// Let's try to import it directly. If it fails, I'll hardcode the values in the helper for simplicity as it's an MVP.
// Actually, for a helper function to be synchronous, hardcoding or importing a local JSON is best.
// I will create a local constant in the helper with the same data for now to ensure it works synchronously without complex async loading in charts.

const PRICES = {
    "SALMÓN DEL ATLÁNTICO": 7500,
    "SALMÓN COHO": 6800,
    "TRUCHA ARCOÍRIS": 6500,
    "CENTOLLA": 18000,
    "ERIZO": 4500,
    "CHORITO": 1200,
    "ALMEJA": 1100,
    "LUGA ROJA": 1800,
    "LUGA NEGRA": 1500,
    "PELILLO": 900,
    "SARDINA COMÚN": 600,
    "ANCHOVETA": 550,
    "JUREL": 700,
    "MERLUZA DE COLA": 1100,
    "MERLUZA DEL SUR": 3200,
    "DEFAULT": 800
};

/**
 * Calculates the economic value (USD) for a given species and volume (tons).
 * @param {string} speciesName - Name of the species.
 * @param {number} tons - Volume in tons.
 * @returns {number} - Value in USD.
 */
export const calculateValue = (speciesName, tons) => {
    if (!speciesName || typeof tons !== 'number') return 0;
    const upperName = speciesName.toUpperCase();
    const price = PRICES[upperName] || PRICES['DEFAULT'];
    return tons * price;
};

/**
 * Formats a number as currency (USD).
 * Examples: 1.5M, 500k, $100
 * @param {number} value - Value in USD.
 * @returns {string} - Formatted string.
 */
export const formatCurrency = (value) => {
    if (value === 0) return '$0';
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
};

/**
 * Formats a number as Tons.
 * @param {number} value 
 * @returns {string}
 */
export const formatTons = (value) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k Ton`;
    }
    return `${value.toFixed(0)} Ton`;
};

export const getAxisFormatter = (viewMode) => {
    return viewMode === 'USD' ? formatCurrency : (val) => `${(val / 1000).toFixed(0)}k`;
};
