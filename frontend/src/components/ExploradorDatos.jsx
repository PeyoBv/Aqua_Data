import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import LineChart from './LineChart';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import HorizontalBarChart from './HorizontalBarChart';
import StackedBarChart from './StackedBarChart';
import MultiLineChart from './MultiLineChart';
import GroupedBarChart from './GroupedBarChart';
import { 
  explorarDatos, 
  obtenerOpcionesDisponibles,
  getAgentDistribution,
  getTopPorts,
  getSpeciesByAgentBreakdown,
  getSeasonalContext,
  getEstadisticasProduccion,
  getBalanceMasas,
  getPerfilIndustrial,
  getOpcionesProduccion
} from '../services/api';

/**
 * Vista 2: Explorador de Datos - Análisis Detallado
 * Permite seleccionar dataset y aplicar filtros dinámicos con selectores
 */
function ExploradorDatos({ region }) {
  const [tipoDato, setTipoDato] = useState('cosecha');
  const [filtrosEspecificos, setFiltrosEspecificos] = useState({
    anio: '',
    mes: '',
    especie: '',
    tipo_elaboracion: '',
    tipo_agente: '' // Nuevo filtro para módulo de Cosechas
  });
  
  // Opciones disponibles para los selectores
  const [opcionesDisponibles, setOpcionesDisponibles] = useState({
    años: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010], // Valores por defecto
    especies: ['SALMON DEL ATLANTICO', 'JUREL', 'MERLUZA COMUN', 'SARDINA ESPAÑOLA', 'ANCHOVETA', 'CONGRIO DORADO', 'JIBIA', 'REINETA', 'BLANQUILLO', 'PEJERREY'], // Valores por defecto
    tiposElaboracion: ['CONGELADO', 'FRESCO', 'CONSERVA', 'REDUCCION'],
    tiposAgente: ['ACUICULTURA', 'ARTESANAL', 'FABRICA', 'INDUSTRIAL'] // Tipos de agente disponibles
  });
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para datos del módulo de Cosechas
  const [dataCosechas, setDataCosechas] = useState({
    agentDistribution: null,
    topPorts: null,
    speciesBreakdown: null,
    seasonalContext: null
  });
  const [loadingCosechas, setLoadingCosechas] = useState(false);

  // Estados para datos del módulo de Producción
  const [dataProduccion, setDataProduccion] = useState({
    estadisticas: null,
    balanceMasas: null,
    perfilIndustrial: null
  });
  const [loadingProduccion, setLoadingProduccion] = useState(false);

  // Cargar opciones disponibles al inicio
  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const response = await obtenerOpcionesDisponibles();
        console.log('✅ Respuesta del servidor:', response);
        
        if (response && response.success && response.opciones) {
          const nuevasOpciones = {
            años: response.opciones.años_disponibles || [],
            especies: response.opciones.especies_disponibles || [],
            tiposElaboracion: response.opciones.tipos_elaboracion || []
          };
          
          console.log('✅ Opciones cargadas:', {
            años: nuevasOpciones.años.length,
            especies: nuevasOpciones.especies.length,
            tipos: nuevasOpciones.tiposElaboracion.length
          });
          
          setOpcionesDisponibles(nuevasOpciones);
        } else {
          console.error('❌ Respuesta inválida:', response);
        }
      } catch (err) {
        console.error('❌ Error cargando opciones:', err);
      }
    };
    
    fetchOpciones();
  }, []);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Preparar parámetros
        const params = {
          tipo_dato: tipoDato,
          region: region
        };

        // Agregar filtros específicos solo si tienen valor
        if (filtrosEspecificos.anio) params.anio = filtrosEspecificos.anio;
        if (filtrosEspecificos.mes) params.mes = filtrosEspecificos.mes;
        if (filtrosEspecificos.especie) params.especie = filtrosEspecificos.especie;
        if (filtrosEspecificos.tipo_elaboracion) params.tipo_elaboracion = filtrosEspecificos.tipo_elaboracion;

        console.log('🔍 Explorando datos con parámetros:', params);
        const response = await explorarDatos(params);
        console.log('✅ Datos recibidos:', response);
        console.log('📊 Gráficos en respuesta:', response?.graficos);
        console.log('📈 porMes:', response?.graficos?.porMes);
        console.log('🐟 porEspecie:', response?.graficos?.porEspecie);
        
        if (!response || !response.success) {
          console.error('❌ Respuesta inválida del servidor:', response);
          setError('Error: Respuesta inválida del servidor');
          setData(null);
        } else {
          setData(response);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
        setError(`Error al explorar datos: ${errorMsg}`);
        console.error('❌ Error fetching explorador data:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipoDato, region, filtrosEspecificos]);

  // Cargar datos específicos del módulo de Cosechas
  useEffect(() => {
    // Solo cargar si estamos en el dataset de cosechas
    if (tipoDato !== 'cosecha') {
      setDataCosechas({
        agentDistribution: null,
        topPorts: null,
        speciesBreakdown: null,
        seasonalContext: null
      });
      return;
    }

    const fetchCosechasData = async () => {
      setLoadingCosechas(true);
      
      try {
        const year = filtrosEspecificos.anio || null;
        // NO filtrar por región para el módulo de Cosechas - mostrar todos los datos
        const regionFilter = null; // Siempre null para mostrar todos los datos

        console.log('🎣 Cargando datos del módulo de Cosechas...', { year, regionOriginal: region });

        // Llamadas paralelas a todas las APIs del módulo de Cosechas
        const [agentDist, ports, speciesBreak, seasonal] = await Promise.allSettled([
          getAgentDistribution(year, regionFilter),
          getTopPorts(year, regionFilter, 5),
          getSpeciesByAgentBreakdown(year, regionFilter, 10),
          getSeasonalContext(year || 2024, regionFilter)
        ]);

        console.log('✅ Resultados del módulo de Cosechas:', {
          agentDist: agentDist.status === 'fulfilled' ? agentDist.value : agentDist.reason,
          ports: ports.status === 'fulfilled' ? ports.value : ports.reason,
          speciesBreak: speciesBreak.status === 'fulfilled' ? speciesBreak.value : speciesBreak.reason,
          seasonal: seasonal.status === 'fulfilled' ? seasonal.value : seasonal.reason
        });

        const cosechasData = {
          agentDistribution: agentDist.status === 'fulfilled' && agentDist.value?.success ? agentDist.value : null,
          topPorts: ports.status === 'fulfilled' && ports.value?.success ? ports.value : null,
          speciesBreakdown: speciesBreak.status === 'fulfilled' && speciesBreak.value?.success ? speciesBreak.value : null,
          seasonalContext: seasonal.status === 'fulfilled' && seasonal.value?.success ? seasonal.value : null
        };

        console.log('📊 Data procesada para gráficas:', {
          agentDistribution: cosechasData.agentDistribution?.data?.length || 0,
          topPorts: cosechasData.topPorts?.data?.length || 0,
          speciesBreakdown: cosechasData.speciesBreakdown?.data?.length || 0,
          seasonalContext: cosechasData.seasonalContext?.data?.length || 0
        });

        setDataCosechas(cosechasData);
      } catch (err) {
        console.error('❌ Error general fetching cosechas module data:', err);
        setDataCosechas({
          agentDistribution: null,
          topPorts: null,
          speciesBreakdown: null,
          seasonalContext: null
        });
      } finally {
        setLoadingCosechas(false);
      }
    };

    fetchCosechasData();
  }, [tipoDato, region, filtrosEspecificos.anio]);

  // Cargar datos específicos del módulo de Producción
  useEffect(() => {
    // Solo cargar si estamos en el dataset de producción
    if (tipoDato !== 'produccion') {
      setDataProduccion({
        estadisticas: null,
        balanceMasas: null,
        perfilIndustrial: null
      });
      return;
    }

    const fetchProduccionData = async () => {
      setLoadingProduccion(true);
      
      try {
        // Preparar filtros (NO incluir región para producción ya que usa códigos numéricos)
        const filtros = {};
        // No enviar región para producción
        if (filtrosEspecificos.anio) filtros.anio = filtrosEspecificos.anio;
        if (filtrosEspecificos.especie) filtros.especie = filtrosEspecificos.especie;
        if (filtrosEspecificos.tipo_elaboracion) filtros.linea_elaboracion = filtrosEspecificos.tipo_elaboracion;

        console.log('🏭 Cargando datos del módulo de Producción...', filtros);

        // Llamadas paralelas a las APIs del módulo de Producción
        const [estadisticas, balanceMasas, perfilIndustrial] = await Promise.allSettled([
          getEstadisticasProduccion(filtros),
          getBalanceMasas(filtros),
          getPerfilIndustrial(filtros)
        ]);

        const produccionData = {
          estadisticas: estadisticas.status === 'fulfilled' && estadisticas.value?.success ? estadisticas.value.estadisticas : null,
          balanceMasas: balanceMasas.status === 'fulfilled' && balanceMasas.value?.success ? balanceMasas.value.data : null,
          perfilIndustrial: perfilIndustrial.status === 'fulfilled' && perfilIndustrial.value?.success ? perfilIndustrial.value.data : null
        };

        console.log('📊 Data de Producción procesada:', {
          estadisticas: produccionData.estadisticas ? 'OK' : 'NULL',
          balanceMasas: produccionData.balanceMasas?.length || 0,
          perfilIndustrial: produccionData.perfilIndustrial?.length || 0
        });

        console.log('🔍 Detalles completos:', {
          estadisticas: produccionData.estadisticas,
          balanceMasasFirst: produccionData.balanceMasas?.[0],
          perfilFirst: produccionData.perfilIndustrial?.[0]
        });

        setDataProduccion(produccionData);
      } catch (err) {
        console.error('❌ Error fetching produccion module data:', err);
        setDataProduccion({
          estadisticas: null,
          balanceMasas: null,
          perfilIndustrial: null
        });
      } finally {
        setLoadingProduccion(false);
      }
    };

    fetchProduccionData();
  }, [tipoDato, region, filtrosEspecificos.anio, filtrosEspecificos.especie, filtrosEspecificos.tipo_elaboracion]);

  // Manejar cambio de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltrosEspecificos(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltrosEspecificos({
      anio: '',
      mes: '',
      especie: '',
      tipo_elaboracion: ''
    });
  };

  // Nombres amigables de datasets
  const getNombreDataset = (tipo) => {
    const nombres = {
      'cosecha': 'Cosechas (Desembarques)',
      'produccion': 'Producción (Materia Prima)',
      'plantas': 'Plantas de Procesamiento'
    };
    return nombres[tipo] || tipo;
  };

  return (
    <div className="explorador-datos">
      <div className="section-header">
        <h2>🔍 Explorador de Datos</h2>
        <p className="section-description">
          Análisis detallado con filtros dinámicos
        </p>
      </div>

      {/* Selector de Dataset */}
      <div className="dataset-selector">
        <label>Seleccionar Dataset:</label>
        <div className="dataset-buttons">
          <button
            className={`dataset-button ${tipoDato === 'cosecha' ? 'active' : ''}`}
            onClick={() => setTipoDato('cosecha')}
          >
            🎣 Cosechas
          </button>
          <button
            className={`dataset-button ${tipoDato === 'produccion' ? 'active' : ''}`}
            onClick={() => setTipoDato('produccion')}
          >
            🏭 Producción
          </button>
          <button
            className={`dataset-button ${tipoDato === 'plantas' ? 'active' : ''}`}
            onClick={() => setTipoDato('plantas')}
          >
            🏢 Plantas
          </button>
        </div>
      </div>

      {/* Filtros Dinámicos */}
      <div className="filtros-dinamicos">
        <h3>Filtros Específicos</h3>
        <div className="filtros-grid">
          {/* Año */}
          <div className="filtro-item">
            <label htmlFor="filtro-anio">Año:</label>
            <select
              id="filtro-anio"
              value={filtrosEspecificos.anio || ''}
              onChange={(e) => {
                const valor = e.target.value;
                console.log('📅 Año seleccionado:', valor);
                handleFiltroChange('anio', valor);
              }}
              className="filtro-select"
            >
              <option value="">Todos los años</option>
              {opcionesDisponibles.años && opcionesDisponibles.años.length > 0 ? (
                opcionesDisponibles.años.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))
              ) : (
                <option disabled>Cargando...</option>
              )}
            </select>
          </div>

          {/* Mes (solo para Cosechas y Plantas, NO para Producción) */}
          {tipoDato !== 'produccion' && (
            <div className="filtro-item">
              <label htmlFor="filtro-mes">Mes:</label>
              <select
                id="filtro-mes"
                value={filtrosEspecificos.mes || ''}
                onChange={(e) => handleFiltroChange('mes', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
          )}

          {/* Especie */}
          <div className="filtro-item">
            <label htmlFor="filtro-especie">Especie:</label>
            <select
              id="filtro-especie"
              value={filtrosEspecificos.especie || ''}
              onChange={(e) => {
                const valor = e.target.value;
                console.log('🐟 Especie seleccionada:', valor);
                handleFiltroChange('especie', valor);
              }}
              className="filtro-select"
            >
              <option value="">Todas las especies</option>
              {opcionesDisponibles.especies && opcionesDisponibles.especies.length > 0 ? (
                opcionesDisponibles.especies.slice(0, 100).map(especie => (
                  <option key={especie} value={especie}>{especie}</option>
                ))
              ) : (
                <option disabled>Cargando...</option>
              )}
            </select>
          </div>

          {/* Tipo de Agente (solo para Cosechas) */}
          {tipoDato === 'cosecha' && (
            <div className="filtro-item">
              <label htmlFor="filtro-agente">Tipo de Agente:</label>
              <select
                id="filtro-agente"
                value={filtrosEspecificos.tipo_agente || ''}
                onChange={(e) => {
                  const valor = e.target.value;
                  console.log('👥 Tipo de agente seleccionado:', valor);
                  handleFiltroChange('tipo_agente', valor);
                }}
                className="filtro-select"
              >
                <option value="">Todos</option>
                {opcionesDisponibles?.tiposAgente?.length > 0 ? (
                  opcionesDisponibles.tiposAgente.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))
                ) : (
                  <>
                    <option value="ACUICULTURA">ACUICULTURA</option>
                    <option value="ARTESANAL">ARTESANAL</option>
                    <option value="FABRICA">FABRICA</option>
                    <option value="INDUSTRIAL">INDUSTRIAL</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Tipo de Elaboración (solo para Producción) */}
          {tipoDato === 'produccion' && (
            <div className="filtro-item">
              <label htmlFor="filtro-elaboracion">Tipo Elaboración:</label>
              <select
                id="filtro-elaboracion"
                value={filtrosEspecificos.tipo_elaboracion || ''}
                onChange={(e) => {
                  const valor = e.target.value;
                  console.log('⚙️ Tipo elaboración seleccionado:', valor);
                  handleFiltroChange('tipo_elaboracion', valor);
                }}
                className="filtro-select"
              >
                <option value="">Todos los tipos</option>
                {opcionesDisponibles.tiposElaboracion && opcionesDisponibles.tiposElaboracion.length > 0 ? (
                  opcionesDisponibles.tiposElaboracion.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))
                ) : (
                  <option disabled>Cargando...</option>
                )}
              </select>
            </div>
          )}

          {/* Botón limpiar */}
          <div className="filtro-item">
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              🗑️ Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Explorando datos...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && data && data.success && (
        <>
          {/* Estadísticas */}
          <div className="estadisticas-explorador">
            <h3>📊 Estadísticas del Dataset: {getNombreDataset(tipoDato)}</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Registros Totales</span>
                <span className="stat-value">{data.estadisticas?.totalRegistros?.toLocaleString() || 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Años Únicos</span>
                <span className="stat-value">{data.estadisticas?.añosUnicos || 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Regiones</span>
                <span className="stat-value">{data.estadisticas?.regionesUnicas || 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Especies</span>
                <span className="stat-value">{data.estadisticas?.especiesUnicas || 0}</span>
              </div>
              {tipoDato === 'cosecha' && data.estadisticas?.toneladasTotales !== undefined && (
                <div className="stat-card highlight">
                  <span className="stat-label">Toneladas Totales</span>
                  <span className="stat-value">{data.estadisticas.toneladasTotales.toLocaleString()}</span>
                </div>
              )}
              {tipoDato === 'produccion' && (
                <>
                  {data.estadisticas?.toneladasMPTotales !== undefined && (
                    <div className="stat-card highlight">
                      <span className="stat-label">Ton. Materia Prima</span>
                      <span className="stat-value">{data.estadisticas.toneladasMPTotales.toLocaleString()}</span>
                    </div>
                  )}
                  {data.estadisticas?.toneladasElaboradasTotales !== undefined && (
                    <div className="stat-card highlight">
                      <span className="stat-label">Ton. Elaboradas</span>
                      <span className="stat-value">{data.estadisticas.toneladasElaboradasTotales.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
              {tipoDato === 'plantas' && data.estadisticas?.plantasUnicas !== undefined && (
                <div className="stat-card highlight">
                  <span className="stat-label">Plantas Únicas</span>
                  <span className="stat-value">{data.estadisticas.plantasUnicas}</span>
                </div>
              )}
            </div>
          </div>

          {/* NUEVAS GRÁFICAS DEL MÓDULO DE COSECHAS */}
          {tipoDato === 'cosecha' && (
            <div className="cosechas-module-section">
              <h3 className="module-title">📊 Análisis Avanzado de Cosechas</h3>
              
              {loadingCosechas && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Cargando análisis avanzado...</p>
                </div>
              )}

              {!loadingCosechas && (
                <>
                  {/* Fila 1: Distribución por Agente y Top Puertos */}
                  <div className="charts-row">
                    {dataCosechas.agentDistribution?.data && dataCosechas.agentDistribution.data.length > 0 ? (
                      <div className="chart-container chart-half">
                        <DonutChart
                          data={dataCosechas.agentDistribution.data}
                          title="Distribución por Agente"
                        />
                      </div>
                    ) : (
                      <div className="chart-container chart-half">
                        <div className="no-data-message">
                          <p>⚠️ No hay datos de distribución por agente</p>
                          <small>Intenta cambiar los filtros de año o región</small>
                        </div>
                      </div>
                    )}

                    {dataCosechas.topPorts?.data && dataCosechas.topPorts.data.length > 0 ? (
                      <div className="chart-container chart-half">
                        <HorizontalBarChart
                          data={dataCosechas.topPorts.data}
                          title="Top 5 Puertos con Mayor Desembarque"
                          dataKey="puerto"
                          valueKey="toneladas"
                        />
                      </div>
                    ) : (
                      <div className="chart-container chart-half">
                        <div className="no-data-message">
                          <p>⚠️ No hay datos de puertos</p>
                          <small>Intenta cambiar los filtros de año o región</small>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fila 2: Especies por Agente */}
                  {dataCosechas.speciesBreakdown?.data && dataCosechas.speciesBreakdown.data.length > 0 ? (
                    <div className="chart-container chart-full">
                      <StackedBarChart
                        data={dataCosechas.speciesBreakdown.data}
                        title="Top 10 Especies - Desglose por Tipo de Agente"
                        agentTypes={dataCosechas.speciesBreakdown.summary?.tipos_agente || ['ACUICULTURA', 'ARTESANAL', 'FABRICA', 'INDUSTRIAL']}
                      />
                    </div>
                  ) : (
                    <div className="chart-container chart-full">
                      <div className="no-data-message">
                        <p>⚠️ No hay datos del desglose de especies por agente</p>
                        <small>Intenta cambiar los filtros de año o región</small>
                      </div>
                    </div>
                  )}

                  {/* Fila 3: Comparación Estacional */}
                  {dataCosechas.seasonalContext?.data && dataCosechas.seasonalContext.data.length > 0 ? (
                    <div className="chart-container chart-full">
                      <MultiLineChart
                        data={dataCosechas.seasonalContext.data}
                        title={`Comparación Estacional: ${filtrosEspecificos.anio || '2024'} vs Promedio Histórico`}
                        lines={[
                          { 
                            dataKey: 'actual', 
                            name: `Año ${filtrosEspecificos.anio || '2024'}`, 
                            color: '#ef4444', 
                            strokeWidth: 4,
                            dotSize: 6
                          },
                          { 
                            dataKey: 'historico', 
                            name: 'Promedio Histórico', 
                            color: '#94a3b8', 
                            strokeWidth: 3,
                            dashed: true,
                            dotSize: 4
                          }
                        ]}
                      />
                    </div>
                  ) : (
                    <div className="chart-container chart-full">
                      <div className="no-data-message">
                        <p>⚠️ No hay datos de comparación estacional</p>
                        <small>Intenta seleccionar un año específico</small>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* NUEVAS GRÁFICAS DEL MÓDULO DE PRODUCCIÓN */}
          {tipoDato === 'produccion' && (
            <div className="produccion-module-section">
              <h3 className="module-title">🏭 Análisis Avanzado de Producción</h3>
              
              {loadingProduccion && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Cargando análisis de producción...</p>
                </div>
              )}

              {!loadingProduccion && (
                <>
                  {/* KPIs de Producción */}
                  {dataProduccion.estadisticas && (
                    <div className="kpis-section">
                      <h4>📊 Indicadores Clave</h4>
                      <div className="kpis-grid">
                        <KPICard
                          title="Total Materia Prima"
                          value={`${dataProduccion.estadisticas.totalMateriaPrima?.toLocaleString('es-CL') || '0'} ton`}
                          icon="📦"
                          color="#3b82f6"
                        />
                        <KPICard
                          title="Total Producción"
                          value={`${dataProduccion.estadisticas.totalProduccion?.toLocaleString('es-CL') || '0'} ton`}
                          icon="🏭"
                          color="#10b981"
                        />
                        <KPICard
                          title="Especies Procesadas"
                          value={dataProduccion.estadisticas.especiesUnicas || 0}
                          icon="🐟"
                          color="#f59e0b"
                        />
                        <KPICard
                          title="Rendimiento Promedio"
                          value={`${dataProduccion.estadisticas.rendimientoPromedio?.toFixed(1) || '0.0'}%`}
                          icon="📈"
                          color="#8b5cf6"
                        />
                      </div>
                    </div>
                  )}

                  {/* Balance de Masas */}
                  {dataProduccion.balanceMasas && dataProduccion.balanceMasas.length > 0 ? (
                    <div className="chart-container chart-full">
                      <GroupedBarChart
                        data={dataProduccion.balanceMasas}
                        title="Balance de Masas por Año"
                        bar1Key="materiaPrima"
                        bar1Name="Materia Prima"
                        bar1Color="#3b82f6"
                        bar2Key="produccion"
                        bar2Name="Producción"
                        bar2Color="#10b981"
                        xKey="año"
                        height={450}
                      />
                    </div>
                  ) : (
                    <div className="chart-container chart-full">
                      <div className="no-data-message">
                        <p>⚠️ No hay datos de balance de masas</p>
                        <small>Intenta cambiar los filtros</small>
                      </div>
                    </div>
                  )}

                  {/* Perfil Industrial */}
                  {dataProduccion.perfilIndustrial && dataProduccion.perfilIndustrial.length > 0 ? (
                    <div className="chart-container chart-full">
                      <DonutChart
                        data={dataProduccion.perfilIndustrial}
                        title="Perfil Industrial - Distribución por Línea de Elaboración"
                      />
                    </div>
                  ) : (
                    <div className="chart-container chart-full">
                      <div className="no-data-message">
                        <p>⚠️ No hay datos de perfil industrial</p>
                        <small>Intenta cambiar los filtros</small>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Filtros Activos */}
          {data.filtros && Object.keys(data.filtros).length > 0 && (
            <div className="filtros-activos">
              <p><strong>Filtros Aplicados:</strong></p>
              <ul>
                {data.filtros.region && <li>Región: {data.filtros.region}</li>}
                {data.filtros.año && <li>Año: {data.filtros.año}</li>}
                {data.filtros.mes && <li>Mes: {data.filtros.mes}</li>}
                {data.filtros.especie && <li>Especie: {data.filtros.especie}</li>}
                {data.filtros.tipo_elaboracion && <li>Tipo Elaboración: {data.filtros.tipo_elaboracion}</li>}
              </ul>
            </div>
          )}
        </>
      )}

      {!loading && !error && data && !data.success && (
        <div className="no-data-container">
          <p>⚠️ {data.message || 'No se encontraron datos con los filtros aplicados'}</p>
        </div>
      )}
    </div>
  );
}

export default ExploradorDatos;
