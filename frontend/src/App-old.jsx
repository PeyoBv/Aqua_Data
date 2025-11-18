import React, { useState, useEffect } from 'react';
import Filters from './components/Filters';
import KPICard from './components/KPICard';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import cosechasAPI from './services/api';
import './App.css';

function App() {
  const [filters, setFilters] = useState({
    anio: null,
    region: null,
    especie: null
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {};
        if (filters.anio) params.anio = filters.anio;
        if (filters.region) params.region = filters.region;
        if (filters.especie) params.especie = filters.especie;

        const response = await cosechasAPI.getCosechas(params);
        setData(response);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="app">
      <div className="container">
        <Filters onFilterChange={handleFilterChange} filters={filters} />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* KPIs */}
            <div className="kpis-grid">
              <KPICard
                title="Cosecha Total"
                value={data.kpis?.cosechaTotal || 0}
                unit="toneladas"
                icon="🐟"
                color="#3b82f6"
              />
              <KPICard
                title="Meses con Datos"
                value={data.kpis?.mesesConDatos || 0}
                unit="meses"
                icon="📅"
                color="#10b981"
              />
              <KPICard
                title="Especies Detectadas"
                value={data.kpis?.especiesDetectadas || 0}
                unit="especies"
                icon="🦈"
                color="#f59e0b"
              />
            </div>

            {/* Gráficos */}
            <div className="charts-grid">
              <div className="chart-full">
                {data.grafico_mensual && data.grafico_mensual.length > 0 ? (
                  <LineChart 
                    data={data.grafico_mensual} 
                    title="Tendencia Mensual de Cosechas"
                  />
                ) : (
                  <div className="no-data">Sin datos mensuales para mostrar</div>
                )}
              </div>

              <div className="chart-full">
                {data.grafico_especies && data.grafico_especies.length > 0 ? (
                  <BarChart 
                    data={data.grafico_especies} 
                    title="TOP 10 Especies por Toneladas"
                    limit={10}
                  />
                ) : (
                  <div className="no-data">Sin datos de especies para mostrar</div>
                )}
              </div>
            </div>

            {/* Información de filtros aplicados */}
            {(filters.anio || filters.region || filters.especie) && (
              <div className="active-filters">
                <p>
                  <strong>Filtros activos:</strong>
                  {filters.anio && ` Año ${filters.anio}`}
                  {filters.region && ` · Región ${filters.region}`}
                  {filters.especie && ` · Especie ${filters.especie}`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
