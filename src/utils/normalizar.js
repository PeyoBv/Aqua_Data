/**
 * Módulo de Utilidades para Normalización de Datos
 * Proporciona funciones reutilizables para limpiar y transformar datos de CSV
 */

/**
 * Normaliza texto: elimina espacios y convierte a mayúsculas
 * @param {*} valor - Valor a normalizar
 * @returns {string} Texto normalizado en mayúsculas, o cadena vacía si es nulo/indefinido
 */
function normalizarTexto(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }
  return String(valor).trim().toUpperCase();
}

/**
 * Normaliza y detecta la región macro según palabras clave o códigos numéricos
 * Convierte variantes de nombres de regiones a formato estándar
 * @param {string|number} textoRegion - Texto o código de región a normalizar
 * @returns {string} Región normalizada (LAGOS, AYSEN, MAGALLANES) o texto original en mayúsculas
 */
function normalizarRegion(textoRegion) {
  if (!textoRegion && textoRegion !== 0) return '';
  
  const textoNormalizado = normalizarTexto(textoRegion);
  
  // Convertir a número para detectar códigos numéricos (ej: "10,0" o "10.0" o "10")
  const codigoNumerico = parseFloat(String(textoRegion).replace(',', '.'));
  
  // Detección de región de Los Lagos (Región X / Código 10)
  if (textoNormalizado.includes('LAGOS') || 
      textoNormalizado.includes('X REGION') ||
      textoNormalizado.includes('10 REGION') ||
      textoNormalizado === 'X' ||
      textoNormalizado === '10' ||
      textoNormalizado === '10,0' ||
      textoNormalizado === '10.0' ||
      codigoNumerico === 10) {
    return 'LAGOS';
  }
  
  // Detección de región de Aysén (Región XI / Código 11)
  if (textoNormalizado.includes('AYSEN') ||
      textoNormalizado.includes('AYSÉN') ||
      textoNormalizado.includes('XI REGION') ||
      textoNormalizado.includes('11 REGION') ||
      textoNormalizado === 'XI' ||
      textoNormalizado === '11' ||
      textoNormalizado === '11,0' ||
      textoNormalizado === '11.0' ||
      codigoNumerico === 11) {
    return 'AYSEN';
  }
  
  // Detección de región de Magallanes (Región XII / Código 12)
  if (textoNormalizado.includes('MAGALLANES') ||
      textoNormalizado.includes('ANTARTICA') ||
      textoNormalizado.includes('ANTÁRTICA') ||
      textoNormalizado.includes('XII REGION') ||
      textoNormalizado.includes('12 REGION') ||
      textoNormalizado === 'XII' ||
      textoNormalizado === '12' ||
      textoNormalizado === '12,0' ||
      textoNormalizado === '12.0' ||
      codigoNumerico === 12) {
    return 'MAGALLANES';
  }
  
  // Si no coincide con ninguna región de interés, retornar texto normalizado
  return textoNormalizado;
}

/**
 * Verifica si un registro pertenece a la Macro-Zona Sur (Lagos, Aysén, Magallanes)
 * @param {string} region - Región a verificar
 * @returns {boolean} True si pertenece a la Macro-Zona Sur
 */
function esRegionMacroZonaSur(region) {
  const regionNormalizada = normalizarRegion(region);
  return regionNormalizada === 'LAGOS' || 
         regionNormalizada === 'AYSEN' || 
         regionNormalizada === 'MAGALLANES';
}

/**
 * Parsea un valor numérico decimal que puede usar coma o punto como separador
 * Maneja formatos: "1234.56", "1234,56", "1.234,56", "1,234.56"
 * @param {*} valor - Valor a parsear
 * @returns {number} Número parseado, o 0 si no es válido
 */
function parsearDecimal(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 0;
  }

  // Convertir a string y limpiar espacios
  let valorStr = String(valor).trim();

  if (valorStr === '' || valorStr === '-' || valorStr === 'N/A' || valorStr === 'null') {
    return 0;
  }

  // Detectar el formato del número
  // Si hay tanto punto como coma, determinar cuál es el separador decimal
  const tienePunto = valorStr.includes('.');
  const tieneComa = valorStr.includes(',');

  if (tienePunto && tieneComa) {
    // Formato europeo: 1.234,56 -> eliminar puntos, reemplazar coma por punto
    const ultimoPunto = valorStr.lastIndexOf('.');
    const ultimaComa = valorStr.lastIndexOf(',');
    
    if (ultimaComa > ultimoPunto) {
      // La coma es el separador decimal: 1.234,56
      valorStr = valorStr.replace(/\./g, '').replace(',', '.');
    } else {
      // El punto es el separador decimal: 1,234.56
      valorStr = valorStr.replace(/,/g, '');
    }
  } else if (tieneComa) {
    // Solo tiene coma: puede ser 1234,56 o 1,234 (miles)
    // Asumimos que es separador decimal si hay 2-3 dígitos después
    const despuesComa = valorStr.split(',')[1];
    if (despuesComa && despuesComa.length <= 3) {
      valorStr = valorStr.replace(',', '.');
    } else {
      valorStr = valorStr.replace(/,/g, '');
    }
  }
  // Si solo tiene punto, dejar como está

  const numero = parseFloat(valorStr);
  
  // Validar que sea un número válido
  if (isNaN(numero) || !isFinite(numero)) {
    return 0;
  }

  return numero;
}

/**
 * Parsea un valor entero de manera robusta
 * @param {*} valor - Valor a parsear
 * @returns {number} Número entero parseado, o 0 si no es válido
 */
function parsearEntero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 0;
  }

  const valorStr = String(valor).trim();
  
  if (valorStr === '' || valorStr === '-' || valorStr === 'N/A' || valorStr === 'null') {
    return 0;
  }

  const numero = parseInt(valorStr, 10);
  
  if (isNaN(numero) || !isFinite(numero)) {
    return 0;
  }

  return numero;
}

/**
 * Normaliza un año, asegurando que sea un entero válido entre 1900 y 2100
 * @param {*} valor - Valor del año
 * @returns {number} Año normalizado, o 0 si no es válido
 */
function normalizarAnio(valor) {
  const anio = parsearEntero(valor);
  
  if (anio < 1900 || anio > 2100) {
    return 0;
  }
  
  return anio;
}

/**
 * Normaliza un mes, asegurando que sea un entero entre 1 y 12
 * @param {*} valor - Valor del mes
 * @returns {number} Mes normalizado (1-12), o 0 si no es válido
 */
function normalizarMes(valor) {
  const mes = parsearEntero(valor);
  
  if (mes < 1 || mes > 12) {
    return 0;
  }
  
  return mes;
}

/**
 * Valida y normaliza un objeto completo de desembarque
 * @param {Object} item - Objeto con los datos crudos del CSV
 * @returns {Object} Objeto normalizado con todos los campos limpios
 */
function normalizarDesembarque(item) {
  return {
    id: parsearEntero(item.id),
    año: normalizarAnio(item.año || item.ano || item.anio),
    aguas: normalizarTexto(item.aguas),
    region: normalizarTexto(item.region || item.región),
    cd_puerto: parsearEntero(item.cd_puerto),
    puerto_desembarque: normalizarTexto(item.puerto_desembarque),
    mes: normalizarMes(item.mes),
    cd_especie: parsearEntero(item.cd_especie),
    especie: normalizarTexto(item.especie),
    toneladas: parsearDecimal(item.toneladas),
    tipo_agente: normalizarTexto(item.tipo_agente)
  };
}

/**
 * Valida y normaliza un objeto de materia prima/producción
 * @param {Object} item - Objeto con los datos crudos del CSV
 * @returns {Object} Objeto normalizado
 */
function normalizarMateriaPrima(item) {
  return {
    id: parsearEntero(item.id),
    año: normalizarAnio(item.año || item.ano || item.anio),
    region: normalizarTexto(item.region || item.región),
    cd_planta: parsearEntero(item.cd_planta),
    planta: normalizarTexto(item.planta),
    mes: normalizarMes(item.mes),
    cd_especie: parsearEntero(item.cd_especie),
    especie: normalizarTexto(item.especie),
    tipo_elaboracion: normalizarTexto(item.tipo_elaboracion || item.tipo_elaboración),
    toneladas_mp: parsearDecimal(item.toneladas_mp),
    toneladas_elaboradas: parsearDecimal(item.toneladas_elaboradas)
  };
}

/**
 * Valida y normaliza un objeto de planta
 * @param {Object} item - Objeto con los datos crudos del CSV
 * @returns {Object} Objeto normalizado
 */
function normalizarPlanta(item) {
  return {
    id: parsearEntero(item.Id || item.id),
    año: normalizarAnio(item.Ano || item.año || item.ano || item.anio),
    region: normalizarRegion(item.Region || item.region || item.región),
    cd_planta: parsearEntero(item['Código Planta'] || item.cd_planta),
    planta: normalizarTexto(item.Nombre_Planta || item.planta),
    mes: normalizarMes(item.Mes || item.mes),
    cd_especie: parsearEntero(item['Código_Especie'] || item.cd_especie),
    especie: normalizarTexto(item.Nombre_especie || item.especie),
    tipo_elaboracion: normalizarTexto(item.tipo_elaboracion || item.tipo_elaboración),
    toneladas_mp: parsearDecimal(item['Materia prima'] || item.toneladas_mp),
    toneladas_elaboradas: parsearDecimal(item['Producción'] || item.toneladas_elaboradas)
  };
}

/**
 * Filtra un array de datos según criterios proporcionados
 * Los criterios pueden incluir: año, region, especie, mes
 * @param {Array} datos - Array de objetos a filtrar
 * @param {Object} criterios - Objeto con los criterios de filtrado
 * @returns {Array} Array filtrado
 */
function filtrarDatos(datos, criterios = {}) {
  if (!Array.isArray(datos)) {
    return [];
  }

  return datos.filter(item => {
    // Filtrar por año
    if (criterios.año !== undefined && criterios.año !== null && criterios.año !== '') {
      const añoCriterio = parsearEntero(criterios.año);
      if (añoCriterio > 0 && item.año !== añoCriterio) {
        return false;
      }
    }

    // Filtrar por región (normalizado)
    if (criterios.region && criterios.region.trim() !== '') {
      const regionNormalizada = normalizarTexto(criterios.region);
      if (item.region !== regionNormalizada) {
        return false;
      }
    }

    // Filtrar por especie (normalizado, busca coincidencia parcial)
    if (criterios.especie && criterios.especie.trim() !== '') {
      const especieNormalizada = normalizarTexto(criterios.especie);
      if (!item.especie.includes(especieNormalizada)) {
        return false;
      }
    }

    // Filtrar por mes
    if (criterios.mes !== undefined && criterios.mes !== null && criterios.mes !== '') {
      const mesCriterio = parsearEntero(criterios.mes);
      if (mesCriterio > 0 && item.mes !== mesCriterio) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Obtiene valores únicos de un campo específico en un array de datos
 * Útil para generar listas de regiones, especies, años disponibles
 * @param {Array} datos - Array de objetos
 * @param {string} campo - Nombre del campo a extraer
 * @returns {Array} Array de valores únicos ordenados
 */
function obtenerValoresUnicos(datos, campo) {
  if (!Array.isArray(datos) || !campo) {
    return [];
  }

  const valoresSet = new Set();
  
  datos.forEach(item => {
    if (item[campo] !== undefined && item[campo] !== null && item[campo] !== '' && item[campo] !== 0) {
      valoresSet.add(item[campo]);
    }
  });

  return Array.from(valoresSet).sort();
}

/**
 * Agrupa datos por un campo específico y suma las toneladas
 * @param {Array} datos - Array de objetos con campo 'toneladas'
 * @param {string} campoClave - Campo por el cual agrupar
 * @returns {Array} Array de objetos {clave, total} ordenados por total descendente
 */
function agruparYSumar(datos, campoClave) {
  if (!Array.isArray(datos) || !campoClave) {
    return [];
  }

  const agrupacion = {};

  datos.forEach(item => {
    const clave = item[campoClave];
    if (clave !== undefined && clave !== null && clave !== '' && clave !== 0) {
      if (!agrupacion[clave]) {
        agrupacion[clave] = 0;
      }
      agrupacion[clave] += item.toneladas || 0;
    }
  });

  return Object.entries(agrupacion)
    .map(([clave, total]) => ({ clave, total }))
    .sort((a, b) => b.total - a.total);
}

module.exports = {
  // Funciones de normalización básicas
  normalizarTexto,
  parsearDecimal,
  parsearEntero,
  normalizarAnio,
  normalizarMes,
  
  // Funciones básicas de normalización
  normalizarTexto,
  normalizarRegion,
  esRegionMacroZonaSur,
  parsearDecimal,
  parsearEntero,
  normalizarAnio,
  normalizarMes,
  
  // Funciones de normalización por tipo de dato
  normalizarDesembarque,
  normalizarMateriaPrima,
  normalizarPlanta,
  
  // Funciones de utilidad para filtrado y análisis
  filtrarDatos,
  obtenerValoresUnicos,
  agruparYSumar
};
