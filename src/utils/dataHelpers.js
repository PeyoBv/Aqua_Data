/**
 * Utilidades para normalización y transformación de datos
 */

/**
 * Normaliza un campo de texto: trim + uppercase
 * @param {string} value - Valor a normalizar
 * @returns {string} Valor normalizado
 */
function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().toUpperCase();
}

/**
 * Convierte un valor decimal, aceptando coma o punto como separador
 * @param {string|number} value - Valor a convertir
 * @returns {number} Valor numérico o 0 si es inválido
 */
function parseDecimal(value) {
  if (value === null || value === undefined || value === '') return 0;
  
  // Convertir a string y reemplazar coma por punto
  const stringValue = String(value).trim().replace(',', '.');
  const parsed = parseFloat(stringValue);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normaliza un objeto completo aplicando las transformaciones según el tipo de dato
 * @param {Object} obj - Objeto a normalizar
 * @param {Object} schema - Esquema que define qué campos son texto o números
 * @returns {Object} Objeto normalizado
 */
function normalizeObject(obj, schema = {}) {
  const normalized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fieldType = schema[key];
    
    if (fieldType === 'number' || fieldType === 'decimal') {
      normalized[key] = parseDecimal(value);
    } else if (fieldType === 'text') {
      normalized[key] = normalizeText(value);
    } else {
      // Por defecto, si parece un número, convertirlo; si no, normalizar como texto
      const trimmedValue = String(value).trim();
      if (trimmedValue && !isNaN(trimmedValue.replace(',', '.'))) {
        normalized[key] = parseDecimal(value);
      } else {
        normalized[key] = normalizeText(value);
      }
    }
  }
  
  return normalized;
}

module.exports = {
  normalizeText,
  parseDecimal,
  normalizeObject
};
