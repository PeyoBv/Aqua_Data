import React, { useState, useEffect, useRef } from 'react';
import KPICard from './KPICard';
import AreaLineChart from './AreaLineChart';
import DonutChart from './DonutChart';
import StackedAreaChart from './StackedAreaChart';
import RegionalComparisonChart from './RegionalComparisonChart';
import RegionalBalanceChart from './RegionalBalanceChart';
import YearComparisonChart from './YearComparisonChart';
import SeasonalityHeatmap from './SeasonalityHeatmap';
import { getEspeciesDisponibles, getTrazabilidad, getMatrizDestino, getEvolucionDestino, getComparacionRegional, getComparacionYoY, getMatrizEstacionalidad } from '../services/comparadorApi';
import ForecastChart from './ForecastChart';
import { generateTrazabilidadPDF } from '../utils/pdfGenerator';
import { calculateValue, formatCurrency } from '../utils/economicCalculator';
import './Comparador.css';

/**
 * Vista 3: Comparador - Trazabilidad Oferta-Demanda
 * Cruza datos de Cosechas (Oferta) con Producción (Demanda)
 */
function Comparador({ region, viewMode }) {
  const [especies, setEspecies] = useState([]);
  const [especieSeleccionada, setEspecieSeleccionada] = useState('');
  const [añoSeleccionado, setAñoSeleccionado] = useState('TODOS');
  const [modoVisualizacion, setModoVisualizacion] = useState('historico'); // 'historico' o 'comparacion'
  const [añoA, setAñoA] = useState(2023);
  const [añoB, setAñoB] = useState(2024);
  const [dataTrazabilidad, setDataTrazabilidad] = useState(null);
  const [dataMatrizDestino, setDataMatrizDestino] = useState(null);
  const [dataEvolucionDestino, setDataEvolucionDestino] = useState(null);
  const [dataComparacionRegional, setDataComparacionRegional] = useState(null);
  const [dataYoY, setDataYoY] = useState(null);
  const [dataEstacionalidad, setDataEstacionalidad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Referencia al contenedor de gráficos para captura de pantalla
  const chartsContainerRef = useRef(null);

  // Cargar especies disponibles al montar el componente
  useEffect(() => {
    const fetchEspecies = async () => {
      try {
        console.log('🔍 Cargando especies disponibles del comparador...');
        const response = await getEspeciesDisponibles();
        console.log('✅ Respuesta de especies:', response);

        if (response.success && response.especies && response.especies.length > 0) {
          setEspecies(response.especies);
          setEspecieSeleccionada(response.especies[0]); // Seleccionar la primera por defecto
          console.log(`📊 ${response.total} especies cargadas. Primera: ${response.especies[0]}`);
        } else {
          const errorMsg = 'No hay especies disponibles en ambos datasets';
          setError(errorMsg);
          console.warn('⚠️', errorMsg, response);
        }
      } catch (err) {
        const errorMsg = 'Error al cargar especies disponibles';
        setError(errorMsg);
        console.error('❌ Error fetching especies:', err);
        console.error('❌ Error details:', err.response?.data || err.message);
      }
    };

    fetchEspecies();
  }, []);

  // Cargar datos cuando cambie la especie, región o año
  useEffect(() => {
    if (!especieSeleccionada) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 🛑 RESET STATES to avoid stale data (ghosting)
      setDataTrazabilidad(null);
      setDataMatrizDestino(null);
      setDataEvolucionDestino(null);
      setDataComparacionRegional(null);
      setDataEstacionalidad(null);

      try {
        const params = {
          especie: especieSeleccionada,
          region: region === 'TODAS' ? 'TODAS' : region
        };

        console.log('📊 Cargando datos del Comparador...', params, 'Año:', añoSeleccionado);

        const [trazabilidad, matrizDestino, evolucionDestino, comparacionRegional, estacionalidad] = await Promise.all([
          getTrazabilidad(params),
          getMatrizDestino(params),
          getEvolucionDestino(params),
          getComparacionRegional({
            especie: especieSeleccionada,
            year: añoSeleccionado,
            region: region === 'TODAS' ? 'TODAS' : region
          }),
          getMatrizEstacionalidad({
            especie: especieSeleccionada,
            region: region === 'TODAS' ? 'TODAS' : region
          })
        ]);

        // ✅ Trazabilidad (Siempre devuelve data, incluso con ceros)
        if (trazabilidad.success) {
          setDataTrazabilidad(trazabilidad);
        } else {
          setError('Error al cargar datos de trazabilidad');
        }

        // ✅ Matriz Destino
        if (matrizDestino.success) {
          setDataMatrizDestino(matrizDestino);
        } else {
          setDataMatrizDestino({ success: false, destinos: [] }); // Clear if fail
        }

        // ✅ Evolución Destino
        if (evolucionDestino.success) {
          setDataEvolucionDestino(evolucionDestino);
        } else {
          setDataEvolucionDestino({ success: false, data: [] }); // Clear if fail
        }

        // ✅ Comparación Regional
        if (comparacionRegional.success) {
          setDataComparacionRegional(comparacionRegional);
        } else {
          setDataComparacionRegional({ success: false, data: [] }); // Clear if fail
        }

        // ✅ Estacionalidad
        if (estacionalidad.success) {
          setDataEstacionalidad(estacionalidad);
        } else {
          setDataEstacionalidad({ success: false, data: [] }); // Clear if fail
        }

      } catch (err) {
        setError('Error al cargar datos del comparador');
        console.error('Error fetching comparador data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [especieSeleccionada, region, añoSeleccionado]);

  // Cargar datos YoY cuando el modo es 'comparacion'
  useEffect(() => {
    if (!especieSeleccionada || modoVisualizacion !== 'comparacion') {
      setDataYoY(null);
      return;
    }

    const fetchYoY = async () => {
      try {
        console.log(`📊 Cargando comparación YoY: ${añoA} vs ${añoB}`);
        const resultado = await getComparacionYoY({
          especie: especieSeleccionada,
          yearA: añoA,
          yearB: añoB,
          region: region
        });

        if (resultado.success) {
          setDataYoY(resultado);
        }
      } catch (err) {
        console.error('Error fetching YoY data:', err);
      }
    };

    fetchYoY();
  }, [especieSeleccionada, añoA, añoB, region, modoVisualizacion]);

  const handleEspecieChange = (e) => {
    setEspecieSeleccionada(e.target.value);
  };

  /**
   * Genera y descarga el reporte PDF ejecutivo
   */
  const handleDownloadReport = async () => {
    console.log('📥 Iniciando descarga de reporte...');
    console.log('Datos disponibles:', {
      especieSeleccionada,
      dataTrazabilidad: !!dataTrazabilidad,
      estadisticas: dataTrazabilidad?.estadisticas,
      dataLength: dataTrazabilidad?.data?.length,
      chartContainer: !!chartsContainerRef.current
    });

    if (!dataTrazabilidad || !especieSeleccionada) {
      alert('No hay datos disponibles para generar el reporte');
      return;
    }

    if (!dataTrazabilidad.estadisticas) {
      alert('No hay estadísticas disponibles. Por favor, recarga la página.');
      return;
    }

    if (!dataTrazabilidad.data || dataTrazabilidad.data.length === 0) {
      alert('No hay datos de trazabilidad disponibles.');
      return;
    }

    setGeneratingPDF(true);

    try {
      // Preparar datos para el PDF
      const pdfParams = {
        especie: especieSeleccionada,
        estadisticas: dataTrazabilidad.estadisticas,
        data: dataTrazabilidad.data,
        region: region === 'TODAS' ? 'TODAS' : region,
        chartContainer: chartsContainerRef.current
      };

      console.log('🔧 Parámetros del PDF:', pdfParams);

      // Generar PDF
      const result = await generateTrazabilidadPDF(pdfParams);

      if (result.success) {
        // Mostrar mensaje de éxito
        console.log(`✅ Reporte generado exitosamente: ${result.fileName}`);
        alert(`✅ Reporte generado: ${result.fileName}`);
      }

    } catch (error) {
      console.error('❌ Error al generar el reporte PDF:', error);
      console.error('Error details:', error.message);
      alert(`Error al generar el reporte PDF: ${error.message}\n\nRevisa la consola para más detalles.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading && !dataTrazabilidad) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando datos del comparador...</p>
      </div>
    );
  }

  if (error && !dataTrazabilidad) {
    return (
      <div className="error-container">
        <p>❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="comparador">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h2>🔄 Comparador: Trazabilidad Oferta-Demanda</h2>
            <p className="section-description">
              Analiza la cadena de suministro cruzando datos de pesca (oferta) con procesamiento industrial (demanda)
            </p>
          </div>

          {/* Botón de Descarga PDF */}
          {dataTrazabilidad && (
            <button
              className="btn-download-pdf"
              onClick={handleDownloadReport}
              disabled={generatingPDF}
              title="Descargar Reporte Ejecutivo en PDF"
            >
              {generatingPDF ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span className="download-icon">📥</span>
                  <span>Descargar Reporte PDF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Selectores de Especie y Año */}
      <div className="comparador-controls">
        <div className="filter-group">
          <label htmlFor="especie-select">
            <strong>🐟 Especie Crítica</strong>
            <span className="filter-hint">Selecciona una especie para analizar su trazabilidad</span>
          </label>
          <select
            id="especie-select"
            value={especieSeleccionada}
            onChange={handleEspecieChange}
            className="filter-select"
          >
            {especies.map(especie => (
              <option key={especie} value={especie}>
                {especie}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="year-select">
            <strong>📅 Período de Análisis</strong>
            <span className="filter-hint">Filtra el Balance Regional por año específico</span>
          </label>
          <select
            id="year-select"
            value={añoSeleccionado}
            onChange={(e) => setAñoSeleccionado(e.target.value)}
            className="filter-select"
          >
            <option value="TODOS">Todos los años (2010-2024)</option>
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {especies.length > 0 && (
          <p className="species-count">
            📋 {especies.length} especies disponibles en ambos datasets
          </p>
        )}
      </div>

      {dataTrazabilidad && (
        <>
          {/* KPIs de Trazabilidad */}
          <div className="kpis-grid">
            {(() => {
              // Lógica para calcular KPIs dinámicos según el año seleccionado
              let kpiData = {
                desembarque: dataTrazabilidad.estadisticas.totalDesembarque,
                materiaPrima: dataTrazabilidad.estadisticas.totalMateriaPrima,
                procesado: dataTrazabilidad.estadisticas.porcentajeProcesado,
                brecha: dataTrazabilidad.estadisticas.totalBrecha,
                periodo: '2010-2024'
              };

              if (añoSeleccionado !== 'TODOS') {
                const yearData = dataTrazabilidad.data.find(d => d.año === parseInt(añoSeleccionado));
                if (yearData) {
                  const desembarque = yearData.desembarque || 0;
                  const materiaPrima = yearData.materiaPrima || 0;
                  const brecha = yearData.brecha || 0;
                  const procesado = desembarque > 0
                    ? ((materiaPrima / desembarque) * 100).toFixed(1)
                    : 0;

                  kpiData = {
                    desembarque,
                    materiaPrima,
                    procesado,
                    brecha,
                    periodo: añoSeleccionado
                  };
                }
              }

              // Economic Layer Conversion
              const isUSD = viewMode === 'USD';
              const displayDesembarque = isUSD
                ? formatCurrency(calculateValue(especieSeleccionada, kpiData.desembarque))
                : `${kpiData.desembarque.toLocaleString('es-CL')} ton`;

              const displayMateriaPrima = isUSD
                ? formatCurrency(calculateValue(especieSeleccionada, kpiData.materiaPrima))
                : `${kpiData.materiaPrima.toLocaleString('es-CL')} ton`;

              const displayBrecha = isUSD
                ? formatCurrency(calculateValue(especieSeleccionada, kpiData.brecha))
                : `${kpiData.brecha.toLocaleString('es-CL')} ton`;

              return (
                <>
                  <KPICard
                    title={isUSD ? "Valor Total Desembarcado" : "Total Desembarcado"}
                    value={displayDesembarque}
                    icon={isUSD ? "💰" : "🎣"}
                    color="#3b82f6"
                    description={`Oferta total de ${especieSeleccionada} (${kpiData.periodo})`}
                  />
                  <KPICard
                    title={isUSD ? "Valor Materia Prima Ind." : "Materia Prima Industrial"}
                    value={displayMateriaPrima}
                    icon="🏭"
                    color="#10b981"
                    description={`Volumen que ingresa a plantas (${kpiData.periodo})`}
                  />
                  <KPICard
                    title="% Procesado Industrialmente"
                    value={`${kpiData.procesado}%`}
                    icon="📊"
                    color="#8b5cf6"
                    description={`¿Cuánto de la captura entra a plantas?`}
                  />
                  <KPICard
                    title={isUSD ? "Valor Otros Destinos" : "Otros Destinos"}
                    value={displayBrecha}
                    icon="⚠️"
                    color="#f59e0b"
                    description="Consumo fresco, exportación directa, harina artesanal"
                  />
                </>
              );
            })()}
          </div>

          {/* Fila Inferior: Evolución del Destino (Izquierda) + Comparación Regional (Derecha) */}
          <div className="destino-section" style={{ marginTop: '24px' }}>
            {/* Columna Izquierda: Evolución del Destino Industrial */}
            {dataEvolucionDestino && dataEvolucionDestino.data && dataEvolucionDestino.lineas && (
              <div className="chart-container chart-half">
                <StackedAreaChart
                  data={dataEvolucionDestino.data}
                  lineas={dataEvolucionDestino.lineas}
                  title="Evolución del Destino Industrial (Por Línea de Elaboración)"
                  description={`Muestra la transformación de la materia prima de ${especieSeleccionada} en diferentes productos industriales a lo largo del tiempo. Cada color representa una línea de elaboración (Harina, Congelado, Conserva, etc.). Las áreas apiladas permiten visualizar tanto la contribución individual como el volumen total procesado por año.`}
                  viewMode={viewMode}
                  especie={especieSeleccionada}
                />
              </div>
            )}

            {/* Columna Derecha: Comparación Regional */}
            {dataComparacionRegional && dataComparacionRegional.data && (
              <div className="chart-container chart-half">
                <RegionalComparisonChart
                  data={dataComparacionRegional.data}
                  title="Comparación Regional: Captura vs Procesamiento"
                  description={`Análisis logístico de ${especieSeleccionada}: dónde se captura el recurso (barras azules) versus dónde se procesa industrialmente (barras naranjas). Esta comparación revela patrones de movilización de materia prima entre regiones y ayuda a identificar oportunidades de integración vertical o eficiencias logísticas.`}
                  especie={especieSeleccionada}
                  viewMode={viewMode}
                />
              </div>
            )}
          </div>

          {/* NUEVA SECCIÓN: Análisis de Estacionalidad (Mapa de Calor) */}
          {dataEstacionalidad && dataEstacionalidad.data && (
            <div className="chart-container chart-full" style={{ marginTop: '24px' }}>
              <SeasonalityHeatmap
                data={dataEstacionalidad.data}
                maxValue={dataEstacionalidad.maxValue}
                especie={especieSeleccionada}
                viewMode={viewMode}
              />
            </div>
          )}

          {/* Contenedor para captura PDF - Incluye gráficos y análisis */}
          <div ref={chartsContainerRef} className="charts-section pdf-capture-area">

            {/* GRÁFICO PRINCIPAL: Tendencia Histórica o Comparación YoY */}
            <div className="chart-container chart-full">
              {/* SWITCH DE MODO */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setModoVisualizacion('historico')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: modoVisualizacion === 'historico' ? '#3b82f6' : '#e2e8f0',
                      color: modoVisualizacion === 'historico' ? 'white' : '#64748b',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📈 Tendencia Histórica
                  </button>
                  <button
                    onClick={() => setModoVisualizacion('comparacion')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: modoVisualizacion === 'comparacion' ? '#3b82f6' : '#e2e8f0',
                      color: modoVisualizacion === 'comparacion' ? 'white' : '#64748b',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔄 Comparación Anual
                  </button>
                </div>

                {/* SELECTORES DE AÑO (solo visible en modo comparación) */}
                {modoVisualizacion === 'comparacion' && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', marginRight: '6px' }}>Año A:</label>
                      <select
                        value={añoA}
                        onChange={(e) => setAñoA(parseInt(e.target.value))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                      >
                        {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', marginRight: '6px' }}>Año B:</label>
                      <select
                        value={añoB}
                        onChange={(e) => setAñoB(parseInt(e.target.value))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                      >
                        {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* RENDERIZADO CONDICIONAL SEGÚN MODO */}
              {modoVisualizacion === 'historico' ? (
                <AreaLineChart
                  data={dataTrazabilidad.data}
                  title={`Trazabilidad de Volumen: ${especieSeleccionada}`}
                  description="Compara año a año el volumen desembarcado (área azul) contra la materia prima que ingresa a plantas industriales (línea verde). La brecha indica destinos alternativos: consumo fresco, exportación sin procesar o elaboración artesanal."
                  viewMode={viewMode}
                  especie={especieSeleccionada}
                />
              ) : (
                dataYoY && (
                  <YearComparisonChart
                    data={dataYoY}
                    yearA={añoA}
                    yearB={añoB}
                    especie={especieSeleccionada}
                    viewMode={viewMode}
                  />
                )
              )}
            </div>

            {/* Matriz de Destino */}
            {dataMatrizDestino && dataMatrizDestino.destinos && (
              <div className="destino-section">
                <div className="chart-container chart-half">
                  <DonutChart
                    data={dataMatrizDestino.destinos}
                    title="Matriz de Destino"
                    description="Distribución del destino final de la captura. El procesamiento industrial representa la fracción que entra a plantas de elaboración, mientras que 'Otros Destinos' incluye consumo humano directo, exportación sin procesar y elaboración artesanal."
                    viewMode={viewMode}
                    especie={especieSeleccionada}
                  />
                </div>

                {/* Eficiencia Logística Regional (Barras Horizontales) */}
                {dataComparacionRegional && dataComparacionRegional.data && (
                  <div className="chart-container chart-half">
                    <RegionalBalanceChart
                      data={dataComparacionRegional.data}
                      title={añoSeleccionado === 'TODOS'
                        ? 'Balance Regional Acumulado (2010-2024)'
                        : `Balance Regional (${añoSeleccionado})`}
                      description={`Balance entre captura (azul) y procesamiento (verde) de ${especieSeleccionada} por región${añoSeleccionado !== 'TODOS' ? ` en el año ${añoSeleccionado}` : ' en el período 2010-2024'}. Las barras horizontales facilitan la lectura de nombres de regiones. Identifica oportunidades de integración vertical y eficiencias en la cadena de suministro.`}
                      especie={especieSeleccionada}
                      year={añoSeleccionado}
                      viewMode={viewMode}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Insights de Destino - Ahora en sección separada */}
            {dataMatrizDestino && dataMatrizDestino.destinos && (
              <div className="destino-section">
                <div className="destino-insights chart-full">
                  <h3 className="chart-title">💡 Insights de Cadena de Suministro</h3>
                  <p className="chart-description">
                    Análisis del flujo de {especieSeleccionada} desde la captura hasta el consumo final
                  </p>

                  <div className="insight-card">
                    <div className="insight-header">
                      <span className="insight-icon">🏭</span>
                      <strong>Procesamiento Industrial</strong>
                    </div>
                    <div className="insight-value">
                      {dataTrazabilidad.estadisticas.porcentajeProcesado}% de la captura
                    </div>
                    <p className="insight-detail">
                      {dataTrazabilidad.estadisticas.totalMateriaPrima.toLocaleString('es-CL')} toneladas
                      ingresan a plantas de elaboración para producir congelados, conservas, harina y aceite.
                    </p>
                  </div>

                  <div className="insight-card">
                    <div className="insight-header">
                      <span className="insight-icon">🌊</span>
                      <strong>Otros Destinos</strong>
                    </div>
                    <div className="insight-value">
                      {dataTrazabilidad.estadisticas.porcentajeOtrosDestinos}% de la captura
                    </div>
                    <p className="insight-detail">
                      {dataTrazabilidad.estadisticas.totalBrecha.toLocaleString('es-CL')} toneladas
                      se destinan a consumo humano directo, exportación sin procesar, harina artesanal u otros usos.
                    </p>
                  </div>

                  {dataTrazabilidad.estadisticas.porcentajeProcesado < 50 && (
                    <div className="insight-card warning">
                      <div className="insight-header">
                        <span className="insight-icon">⚠️</span>
                        <strong>Alerta de Baja Industrialización</strong>
                      </div>
                      <p className="insight-detail">
                        Menos del 50% de la captura de {especieSeleccionada} ingresa a plantas industriales.
                        Esto puede indicar exportación directa, consumo fresco o procesamiento artesanal predominante.
                      </p>
                    </div>
                  )}

                  {dataTrazabilidad.estadisticas.porcentajeProcesado > 80 && (
                    <div className="insight-card success">
                      <div className="insight-header">
                        <span className="insight-icon">✅</span>
                        <strong>Alta Integración Industrial</strong>
                      </div>
                      <p className="insight-detail">
                        Más del 80% de {especieSeleccionada} se procesa industrialmente,
                        indicando una cadena de suministro bien integrada con la industria de elaboración.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SECCIÓN DE PROYECCIÓN (Siempre visible si hay datos) */}
      <div className="chart-container chart-full" style={{ marginTop: '24px' }}>
        <ForecastChart
          species={especieSeleccionada}
          region={region === 'TODAS' ? 'TODAS' : region}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}

export default Comparador;
