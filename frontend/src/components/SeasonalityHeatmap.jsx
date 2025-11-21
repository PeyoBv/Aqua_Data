import React, { useState, useEffect } from 'react';
import './SeasonalityHeatmap.css';

/**
 * Componente de Mapa de Calor Estacional - A PRUEBA DE BALAS
 * Procesa datos "sucios" del backend con validación exhaustiva
 * 
 * @param {Array} rawData - Datos crudos del backend (puede venir en cualquier formato)
 * @param {string} especie - Nombre de la especie analizada
 */
const SeasonalityHeatmap = ({ data: rawData = [], maxValue: rawMaxValue = 0, especie = '' }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [parseErrors, setParseErrors] = useState([]);
  
  // Estados para filtro de rango de años
  const [startYear, setStartYear] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  /**
   * 🛡️ FUNCIÓN A PRUEBA DE BALAS - REESCRITA
   * Procesa datos crudos con normalización de claves y validación estricta
   */
  useEffect(() => {
    console.log("🔍 [SeasonalityHeatmap] INICIO DEL PARSING");
    console.log("📦 RAW DATA RECIBIDA:", rawData);
    console.log("📊 Tipo de dato:", Array.isArray(rawData) ? 'Array' : typeof rawData);
    console.log("📏 Longitud:", rawData?.length);
    
    if (rawData && rawData.length > 0) {
      console.log("🔬 ESTRUCTURA DEL PRIMER REGISTRO:");
      console.log(JSON.stringify(rawData[0], null, 2));
      console.log("🔑 CLAVES DETECTADAS:", Object.keys(rawData[0] || {}));
    }

    // Reiniciar estado
    const errors = [];
    let calculatedMaxValue = 0;

    // Validar que sea un array
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn("⚠️ No hay datos para procesar o no es un array");
      setProcessedData([]);
      setMaxValue(0);
      return;
    }

    // Procesar cada registro
    const processedYears = rawData.map((yearRecord, index) => {
      console.log(`\n📅 Procesando registro #${index}:`, yearRecord);

      // 1. Extraer AÑO con múltiples fallbacks (case-insensitive)
      const yearRaw = yearRecord.year || yearRecord.Year || yearRecord.año || 
                      yearRecord.Año || yearRecord.YEAR || yearRecord.ANO;
      const year = parseInt(String(yearRaw), 10);
      
      if (isNaN(year) || year < 1900 || year > 2100) {
        const error = `❌ Año inválido en registro #${index}: ${yearRaw}`;
        console.error(error);
        errors.push(error);
        return null;
      }

      console.log(`✅ Año detectado: ${year}`);

      // 2. Extraer MESES con múltiples fallbacks
      const monthsRaw = yearRecord.months || yearRecord.Months || 
                        yearRecord.meses || yearRecord.Meses || 
                        yearRecord.MONTHS || yearRecord.MESES || [];

      if (!Array.isArray(monthsRaw)) {
        const error = `❌ Meses no es un array en registro #${index}`;
        console.error(error);
        errors.push(error);
        return null;
      }

      console.log(`📊 Procesando ${monthsRaw.length} meses para año ${year}`);

      // 3. Procesar cada mes con validación ESTRICTA
      const processedMonths = monthsRaw.map((monthRecord, mIndex) => {
        // 3.1 Extraer MES (número 1-12)
        const mesRaw = monthRecord.month || monthRecord.Month || 
                       monthRecord.mes || monthRecord.Mes || 
                       monthRecord.MONTH || monthRecord.MES;
        const mesIndex = parseInt(String(mesRaw), 10);

        // VALIDACIÓN DE RANGO: 1-12
        if (isNaN(mesIndex) || mesIndex < 1 || mesIndex > 12) {
          console.warn(`⚠️ Mes inválido ignorado: ${mesRaw} (registro año ${year}, mes #${mIndex})`);
          return null;
        }

        // 3.2 Extraer NOMBRE DEL MES
        const monthNameRaw = monthRecord.monthName || monthRecord.MonthName || 
                             monthRecord.monthname || monthRecord.nombreMes ||
                             monthRecord.month_name || monthRecord.name ||
                             // Fallback: Generar nombre si no existe
                             ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                              'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][mesIndex - 1];
        
        const monthName = String(monthNameRaw).substring(0, 3); // Truncar a 3 caracteres

        // 3.3 Extraer VALOR (toneladas) con CONVERSIÓN FORZADA
        const valRaw = monthRecord.value || monthRecord.Value || 
                       monthRecord.toneladas || monthRecord.Toneladas ||
                       monthRecord.TONELADAS || monthRecord.ton || 0;

        let value = 0;
        
        // Si es string, limpiar formato europeo (1.234,56) → 1234.56
        if (typeof valRaw === 'string') {
          const cleaned = valRaw
            .replace(/\./g, '')    // Eliminar puntos (separador de miles)
            .replace(',', '.');     // Cambiar coma por punto (separador decimal)
          value = parseFloat(cleaned) || 0;
        } else {
          value = parseFloat(valRaw) || 0;
        }

        // Actualizar valor máximo
        if (value > calculatedMaxValue) {
          calculatedMaxValue = value;
        }

        console.log(`  ✓ Mes ${mesIndex} (${monthName}): ${value} ton`);

        return {
          month: mesIndex,
          monthName: monthName,
          value: value
        };
      }).filter(m => m !== null); // Eliminar meses inválidos

      // Verificar que tengamos 12 meses
      if (processedMonths.length !== 12) {
        console.warn(`⚠️ Año ${year} tiene ${processedMonths.length} meses en lugar de 12. Rellenando...`);
        
        // Rellenar meses faltantes con ceros
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const completeMonths = [];
        
        for (let i = 1; i <= 12; i++) {
          const existingMonth = processedMonths.find(m => m.month === i);
          if (existingMonth) {
            completeMonths.push(existingMonth);
          } else {
            completeMonths.push({
              month: i,
              monthName: monthNames[i - 1],
              value: 0
            });
          }
        }
        
        return {
          year: year,
          months: completeMonths
        };
      }

      return {
        year: year,
        months: processedMonths
      };
    }).filter(y => y !== null); // Eliminar años inválidos

    console.log("\n✨ RESULTADO DEL PARSING:");
    console.log(`📊 Años procesados: ${processedYears.length}`);
    console.log(`📈 Valor máximo calculado: ${calculatedMaxValue}`);
    console.log(`❌ Errores encontrados: ${errors.length}`);
    
    if (errors.length > 0) {
      console.error("🚨 ERRORES DE PARSING:", errors);
    }

    setProcessedData(processedYears);
    setMaxValue(calculatedMaxValue);
    setParseErrors(errors);

    // Configurar años disponibles y rango inicial
    if (processedYears.length > 0) {
      const years = processedYears.map(y => y.year).sort((a, b) => a - b);
      setAvailableYears(years);
      
      // Si no hay filtros configurados, mostrar últimos 10 años por defecto
      if (startYear === null || endYear === null) {
        const currentYear = new Date().getFullYear();
        const defaultStartYear = Math.max(years[0], currentYear - 9);
        const defaultEndYear = years[years.length - 1];
        
        setStartYear(defaultStartYear);
        setEndYear(defaultEndYear);
      }
    }
  }, [rawData]);

  // Validar datos procesados
  if (!processedData || processedData.length === 0) {
    return (
      <div className="seasonality-heatmap-empty">
        <div className="empty-icon">📅</div>
        <div className="empty-content">
          <p className="empty-title">No hay datos de estacionalidad</p>
          <p className="empty-subtitle">
            Selecciona una especie para visualizar el patrón estacional de capturas
          </p>
          {parseErrors.length > 0 && (
            <details style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#ef4444' }}>
              <summary>Errores de parsing detectados</summary>
              <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                {parseErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Filtrar datos por rango de años seleccionado
  const filteredData = processedData.filter(yearData => {
    if (startYear === null || endYear === null) return true;
    return yearData.year >= startYear && yearData.year <= endYear;
  });

  // Recalcular maxValue para el rango filtrado
  const filteredMaxValue = filteredData.reduce((max, yearData) => {
    const yearMax = Math.max(...yearData.months.map(m => m.value));
    return Math.max(max, yearMax);
  }, 0);

  /**
   * Calcula el color de la celda basado en la intensidad
   * CORRECCIÓN CRÍTICA: Escala logarítmica para visibilidad garantizada
   * @param {number} value - Toneladas capturadas
   * @returns {string} Color en formato rgba
   */
  const getCellColor = (value) => {
    // DEBUG: Detectar valores undefined o null
    if (value === undefined || value === null) {
      console.warn('⚠️ Valor undefined/null en celda del heatmap');
      return '#ef4444'; // ROJO para debug visual
    }

    // Sin captura: gris muy suave
    if (value === 0) {
      return '#f1f5f9';
    }
    
    // VISIBILIDAD GARANTIZADA: Escala logarítmica
    // Opacidad mínima 40% para cualquier valor > 0
    // Escala logarítmica para dar peso visual a valores medios
    const opacity = 0.4 + (0.6 * (Math.log(value + 1) / Math.log(filteredMaxValue + 1)));
    
    // Asegurar que opacity esté entre 0.4 y 1
    const finalOpacity = Math.max(0.4, Math.min(1, opacity));
    
    return `rgba(59, 130, 246, ${finalOpacity})`; // Azul corporativo con opacidad calculada
  };

  /**
   * Formatea las toneladas para el tooltip
   */
  const formatToneladas = (value) => {
    if (value === 0 || value === null) return '0 Ton';
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} K Ton`;
    }
    return `${value.toFixed(1)} Ton`;
  };

  /**
   * Maneja el reseteo del filtro a últimos 10 años
   */
  const handleResetRange = () => {
    if (availableYears.length === 0) return;
    const currentYear = new Date().getFullYear();
    const defaultStartYear = Math.max(availableYears[0], currentYear - 9);
    const defaultEndYear = availableYears[availableYears.length - 1];
    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
  };

  /**
   * Maneja el evento hover sobre una celda
   */
  const handleCellHover = (year, monthData, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredCell({
      year,
      month: monthData.monthName,
      value: monthData.value,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="seasonality-heatmap-container">
      {/* Header con Controles de Filtro */}
      <div className="heatmap-header">
        <div className="heatmap-title-section">
          <h3 className="heatmap-title">Análisis de Estacionalidad</h3>
          <p className="heatmap-subtitle">
            Distribución mensual de capturas de <strong>{especie}</strong>
          </p>
        </div>
        
        {/* Barra de Controles de Rango */}
        {availableYears.length > 0 && (
          <div className="heatmap-controls">
            <div className="control-group">
              <label htmlFor="start-year" className="control-label">Desde:</label>
              <select
                id="start-year"
                className="year-select"
                value={startYear || ''}
                onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="end-year" className="control-label">Hasta:</label>
              <select
                id="end-year"
                className="year-select"
                value={endYear || ''}
                onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button
              className="reset-button"
              onClick={handleResetRange}
              title="Restablecer a últimos 10 años"
            >
              ↺ Últimos 10 años
            </button>
          </div>
        )}
      </div>

      {/* Mensaje si no hay datos en el rango seleccionado */}
      {filteredData.length === 0 ? (
        <div className="seasonality-heatmap-empty">
          <div className="empty-icon">📅</div>
          <div className="empty-content">
            <p className="empty-title">No hay datos en el rango seleccionado</p>
            <p className="empty-subtitle">
              Intenta ajustar los años de inicio y fin para ver más información
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Leyenda de Escala */}
          <div className="heatmap-legend">
            <span className="legend-label">Baja Captura</span>
            <div className="legend-gradient" />
            <span className="legend-label">Alta Captura ({formatToneladas(filteredMaxValue)})</span>
          </div>

          {/* Grid Container */}
          <div className="heatmap-grid-wrapper">
            <div className="heatmap-grid">
              {/* Header Row: Meses */}
              <div className="heatmap-cell heatmap-header-cell corner-cell">Año</div>
              {filteredData.length > 0 && filteredData[0].months.map((monthData) => (
                <div key={monthData.month} className="heatmap-cell heatmap-header-cell">
                  {monthData.monthName}
                </div>
              ))}

              {/* Data Rows: Años */}
              {filteredData.map((yearData) => (
                <React.Fragment key={yearData.year}>
                  {/* Year Label */}
                  <div className="heatmap-cell heatmap-year-cell">
                    {yearData.year}
                  </div>

                  {/* Month Cells */}
                  {yearData.months.map((monthData) => (
                    <div
                      key={`${yearData.year}-${monthData.month}`}
                      className="heatmap-cell heatmap-data-cell"
                      style={{
                        backgroundColor: getCellColor(monthData.value)
                      }}
                      onMouseEnter={(e) => handleCellHover(yearData.year, monthData, e)}
                      onMouseLeave={handleCellLeave}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="heatmap-stats">
            <div className="stat-item">
              <span className="stat-label">Años Analizados:</span>
              <span className="stat-value">{filteredData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rango:</span>
              <span className="stat-value">
                {filteredData[filteredData.length - 1]?.year} - {filteredData[0]?.year}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Captura Máxima:</span>
              <span className="stat-value">{formatToneladas(filteredMaxValue)}</span>
            </div>
          </div>
        </>
      )}

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="heatmap-tooltip"
          style={{
            position: 'fixed',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="tooltip-content">
            <strong>{hoveredCell.month} {hoveredCell.year}</strong>
            <br />
            {formatToneladas(hoveredCell.value)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalityHeatmap;
