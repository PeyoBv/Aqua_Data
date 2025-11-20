import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import GroupedBarChart from './GroupedBarChart';
import DonutChart from './DonutChart';
import {
  getEstadisticasProduccion,
  getBalanceMasas,
  getPerfilIndustrial,
  getOpcionesProduccion
} from '../services/api';
import './ProduccionDatos.css';

/**
 * Dashboard de Producción - Materia Prima y Elaboración
 * Visualiza KPIs, Balance de Masas y Perfil Industrial
 */
function ProduccionDatos({ region }) {
  const [filtros, setFiltros] = useState({
    anio: '',
    especie: '',
    linea_elaboracion: ''
  });

  const [opciones, setOpciones] = useState({
    años: [],
    especies: [],
    lineasElaboracion: []
  });

  const [estadisticas, setEstadisticas] = useState(null);
  const [balanceMasas, setBalanceMasas] = useState(null);
  const [perfilIndustrial, setPerfilIndustrial] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar opciones disponibles al inicio
  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const response = await getOpcionesProduccion();
        if (response && response.success) {
          setOpciones({
            años: response.opciones.años || [],
            especies: response.opciones.especies || [],
            lineasElaboracion: response.opciones.lineasElaboracion || []
          });
          console.log('✅ Opciones de producción cargadas:', response.opciones);
        }
      } catch (err) {
        console.error('❌ Error cargando opciones de producción:', err);
      }
    };

    fetchOpciones();
  }, []);

  // Cargar datos cuando cambien los filtros o la región
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Preparar parámetros de filtros
        const params = {};
        if (region && region !== 'TODAS') params.region = region;
        if (filtros.anio) params.anio = filtros.anio;
        if (filtros.especie) params.especie = filtros.especie;
        if (filtros.linea_elaboracion) params.linea_elaboracion = filtros.linea_elaboracion;

        console.log('🔍 Cargando datos de producción con filtros:', params);

        // Llamadas paralelas a las 3 APIs
        const [estadisticasRes, balanceRes, perfilRes] = await Promise.allSettled([
          getEstadisticasProduccion(params),
          getBalanceMasas(params),
          getPerfilIndustrial(params)
        ]);

        // Procesar estadísticas (KPIs)
        if (estadisticasRes.status === 'fulfilled' && estadisticasRes.value?.success) {
          setEstadisticas(estadisticasRes.value.estadisticas);
          console.log('✅ Estadísticas cargadas:', estadisticasRes.value.estadisticas);
        } else {
          console.error('❌ Error en estadísticas:', estadisticasRes.reason);
          setEstadisticas(null);
        }

        // Procesar balance de masas
        if (balanceRes.status === 'fulfilled' && balanceRes.value?.success) {
          setBalanceMasas(balanceRes.value.data);
          console.log('✅ Balance de masas cargado:', balanceRes.value.data?.length, 'años');
        } else {
          console.error('❌ Error en balance de masas:', balanceRes.reason);
          setBalanceMasas(null);
        }

        // Procesar perfil industrial
        if (perfilRes.status === 'fulfilled' && perfilRes.value?.success) {
          setPerfilIndustrial(perfilRes.value.data);
          console.log('✅ Perfil industrial cargado:', perfilRes.value.data?.length, 'líneas');
        } else {
          console.error('❌ Error en perfil industrial:', perfilRes.reason);
          setPerfilIndustrial(null);
        }

      } catch (err) {
        console.error('❌ Error general cargando datos de producción:', err);
        setError('Error al cargar los datos de producción');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region, filtros]);

  // Manejador de cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      anio: '',
      especie: '',
      linea_elaboracion: ''
    });
  };

  return (
    <div className="produccion-datos">
      <header className="produccion-header">
        <h2>🏭 Dashboard de Producción</h2>
        <p>Análisis de Materia Prima y Elaboración Industrial</p>
      </header>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>🔍 Filtros</h3>
        <div className="filtros-grid">
          {/* Año */}
          <div className="filtro-item">
            <label htmlFor="anio">Año:</label>
            <select
              id="anio"
              value={filtros.anio}
              onChange={(e) => handleFiltroChange('anio', e.target.value)}
            >
              <option value="">Todos los años</option>
              {opciones.años.map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          {/* Especie */}
          <div className="filtro-item">
            <label htmlFor="especie">Especie:</label>
            <select
              id="especie"
              value={filtros.especie}
              onChange={(e) => handleFiltroChange('especie', e.target.value)}
            >
              <option value="">Todas las especies</option>
              {opciones.especies.map(especie => (
                <option key={especie} value={especie}>{especie}</option>
              ))}
            </select>
          </div>

          {/* Línea de Elaboración */}
          <div className="filtro-item">
            <label htmlFor="linea_elaboracion">Línea de Elaboración:</label>
            <select
              id="linea_elaboracion"
              value={filtros.linea_elaboracion}
              onChange={(e) => handleFiltroChange('linea_elaboracion', e.target.value)}
            >
              <option value="">Todas las líneas</option>
              {opciones.lineasElaboracion.map(linea => (
                <option key={linea} value={linea}>{linea}</option>
              ))}
            </select>
          </div>

          {/* Botón Limpiar */}
          <div className="filtro-item">
            <button onClick={limpiarFiltros} className="btn-limpiar">
              🗑️ Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando datos de producción...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* KPIs */}
      {!loading && estadisticas && (
        <div className="kpis-section">
          <h3>📊 Indicadores Clave</h3>
          <div className="kpis-grid">
            <KPICard
              title="Total Materia Prima"
              value={`${estadisticas.totalMateriaPrima?.toLocaleString('es-CL') || '0'} ton`}
              icon="📦"
              color="#3b82f6"
            />
            <KPICard
              title="Total Producción"
              value={`${estadisticas.totalProduccion?.toLocaleString('es-CL') || '0'} ton`}
              icon="🏭"
              color="#10b981"
            />
            <KPICard
              title="Especies Procesadas"
              value={estadisticas.especiesUnicas || 0}
              icon="🐟"
              color="#f59e0b"
            />
            <KPICard
              title="Rendimiento Promedio"
              value={`${estadisticas.rendimientoPromedio?.toFixed(1) || '0.0'}%`}
              icon="📈"
              color="#8b5cf6"
            />
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos de KPIs */}
      {!loading && !estadisticas && (
        <div className="no-data-message">
          <p>⚠️ No hay datos disponibles con los filtros aplicados</p>
        </div>
      )}

      {/* Gráficos */}
      {!loading && (
        <div className="graficos-section">
          <h3>📈 Visualizaciones</h3>
          
          <div className="graficos-grid">
            {/* Balance de Masas */}
            <div className="grafico-full">
              <GroupedBarChart
                data={balanceMasas || []}
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

            {/* Perfil Industrial */}
            <div className="grafico-full">
              <DonutChart
                data={perfilIndustrial || []}
                title="Perfil Industrial - Distribución por Línea de Elaboración"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtros Activos */}
      {(filtros.anio || filtros.especie || filtros.linea_elaboracion) && (
        <div className="filtros-activos">
          <h4>🏷️ Filtros Aplicados:</h4>
          <div className="filtros-tags">
            {filtros.anio && <span className="tag">Año: {filtros.anio}</span>}
            {filtros.especie && <span className="tag">Especie: {filtros.especie}</span>}
            {filtros.linea_elaboracion && <span className="tag">Línea: {filtros.linea_elaboracion}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProduccionDatos;
