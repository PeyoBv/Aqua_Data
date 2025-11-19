import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import LineChart from './LineChart';
import BarChart from './BarChart';
import { explorarDatos, obtenerOpcionesDisponibles } from '../services/api';

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
    tipo_elaboracion: ''
  });
  
  // Opciones disponibles para los selectores
  const [opcionesDisponibles, setOpcionesDisponibles] = useState({
    años: [],
    especies: [],
    tiposElaboracion: []
  });
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar opciones disponibles al inicio
  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const response = await obtenerOpcionesDisponibles();
        if (response.success && response.opciones) {
          setOpcionesDisponibles({
            años: response.opciones.años_disponibles || [],
            especies: response.opciones.especies_disponibles || [],
            tiposElaboracion: response.opciones.tipos_elaboracion || []
          });
        }
      } catch (err) {
        console.error('Error cargando opciones:', err);
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

        const response = await explorarDatos(params);
        setData(response);
      } catch (err) {
        setError('Error al explorar datos. Por favor, intenta nuevamente.');
        console.error('Error fetching explorador data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipoDato, region, filtrosEspecificos]);

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
              value={filtrosEspecificos.anio}
              onChange={(e) => handleFiltroChange('anio', e.target.value)}
            >
              <option value="">Todos los años</option>
              {opcionesDisponibles.años.map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div className="filtro-item">
            <label htmlFor="filtro-mes">Mes:</label>
            <select
              id="filtro-mes"
              value={filtrosEspecificos.mes}
              onChange={(e) => handleFiltroChange('mes', e.target.value)}
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

          {/* Especie */}
          <div className="filtro-item">
            <label htmlFor="filtro-especie">Especie:</label>
            <select
              id="filtro-especie"
              value={filtrosEspecificos.especie}
              onChange={(e) => handleFiltroChange('especie', e.target.value)}
            >
              <option value="">Todas las especies</option>
              {opcionesDisponibles.especies.slice(0, 50).map(especie => (
                <option key={especie} value={especie}>{especie}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Elaboración (solo para Producción) */}
          {tipoDato === 'produccion' && (
            <div className="filtro-item">
              <label htmlFor="filtro-elaboracion">Tipo Elaboración:</label>
              <select
                id="filtro-elaboracion"
                value={filtrosEspecificos.tipo_elaboracion}
                onChange={(e) => handleFiltroChange('tipo_elaboracion', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {opcionesDisponibles.tiposElaboracion.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
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
              {tipoDato === 'cosecha' && (
                <div className="stat-card highlight">
                  <span className="stat-label">Toneladas Totales</span>
                  <span className="stat-value">{data.estadisticas?.toneladasTotales?.toLocaleString() || 0}</span>
                </div>
              )}
              {tipoDato === 'produccion' && (
                <>
                  <div className="stat-card highlight">
                    <span className="stat-label">Ton. Materia Prima</span>
                    <span className="stat-value">{data.estadisticas?.toneladasMPTotales?.toLocaleString() || 0}</span>
                  </div>
                  <div className="stat-card highlight">
                    <span className="stat-label">Ton. Elaboradas</span>
                    <span className="stat-value">{data.estadisticas?.toneladasElaboradasTotales?.toLocaleString() || 0}</span>
                  </div>
                </>
              )}
              {tipoDato === 'plantas' && (
                <div className="stat-card highlight">
                  <span className="stat-label">Plantas Únicas</span>
                  <span className="stat-value">{data.estadisticas?.plantasUnicas || 0}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gráficos */}
          <div className="charts-section">
            {/* Distribución Mensual */}
            <div className="chart-container chart-full">
              <h3>📅 Distribución Mensual</h3>
              {data.graficos?.porMes && data.graficos.porMes.length > 0 ? (
                <LineChart
                  data={data.graficos.porMes}
                  title="Toneladas por Mes"
                  xKey="mes"
                  yKey="toneladas"
                />
              ) : (
                <div className="no-data-message">
                  <p>Sin datos mensuales para mostrar con los filtros aplicados</p>
                </div>
              )}
            </div>

            {/* Top Especies */}
            <div className="chart-container chart-full">
              <h3>🐟 Top 10 Especies</h3>
              {data.graficos?.porEspecie && data.graficos.porEspecie.length > 0 ? (
                <BarChart
                  data={data.graficos.porEspecie}
                  title="Especies por Toneladas"
                  dataKey="especie"
                  valueKey="toneladas"
                  limit={10}
                />
              ) : (
                <div className="no-data-message">
                  <p>Sin datos de especies para mostrar con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>

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
