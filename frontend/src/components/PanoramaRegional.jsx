import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import LineChart from './LineChart';
import BarChart from './BarChart';
import { getPanoramaGeneral } from '../services/api';

/**
 * Vista 1: Panorama Regional - Resumen Ejecutivo
 * Muestra KPIs y gráficos comparativos de la región seleccionada
 */
function PanoramaRegional({ region }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos cuando cambie la región
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getPanoramaGeneral(region);
        setData(response);
      } catch (err) {
        setError('Error al cargar datos del panorama regional. Por favor, intenta nuevamente.');
        console.error('Error fetching panorama data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region]);

  // Mapeo de nombres de regiones para mostrar
  const getNombreRegion = (codigo) => {
    const nombres = {
      'LAGOS': 'Los Lagos',
      'AYSEN': 'Aysén',
      'MAGALLANES': 'Magallanes y Antártica Chilena'
    };
    return nombres[codigo] || codigo;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando panorama regional...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="no-data-container">
        <p>⚠️ {data?.message || 'No hay datos disponibles para esta región'}</p>
      </div>
    );
  }

  return (
    <div className="panorama-regional">
      <div className="section-header">
        <h2>📊 Panorama Regional: {getNombreRegion(region)}</h2>
        <p className="section-description">
          Resumen ejecutivo de la actividad pesquera y de procesamiento
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="kpis-grid">
        <KPICard
          title="Total Cosechado"
          value={data.kpis?.totalCosechado || 0}
          unit="toneladas"
          icon="🎣"
          color="#3b82f6"
          description="Desembarques totales registrados"
        />
        <KPICard
          title="Total Procesado"
          value={data.kpis?.totalProcesado || 0}
          unit="toneladas"
          icon="🏭"
          color="#10b981"
          description="Materia prima elaborada en plantas"
        />
        <KPICard
          title="Plantas Activas"
          value={data.kpis?.numeroPlantas || 0}
          unit="plantas"
          icon="🏢"
          color="#f59e0b"
          description="Infraestructura de procesamiento"
        />
      </div>

      {/* Gráficos */}
      <div className="charts-section">
        {/* Gráfico Comparativo Anual */}
        <div className="chart-container chart-full">
          <h3>📈 Evolución Anual: Cosecha vs. Capacidad de Plantas</h3>
          {data.grafico_anual && data.grafico_anual.length > 0 ? (
            <LineChart
              data={data.grafico_anual}
              title="Comparativa por Año"
              description="Compara la evolución temporal de la cosecha total contra la capacidad instalada de plantas. Identifica tendencias de crecimiento, estacionalidad y correlación entre extracción y procesamiento industrial."
              multiSeries={true}
              xKey="año"
              series={[
                {
                  key: 'cosechaTotal',
                  label: 'Cosecha (Ton)',
                  color: '#3b82f6'
                },
                {
                  key: 'capacidadPlantas',
                  label: 'Plantas Activas',
                  color: '#10b981'
                }
              ]}
            />
          ) : (
            <div className="no-data-message">
              <p>Sin datos históricos disponibles para esta región</p>
            </div>
          )}
        </div>

        {/* Principales Especies */}
        <div className="chart-container chart-half">
          <h3>🐟 Top 5 Especies de la Región</h3>
          {data.principales_especies && data.principales_especies.length > 0 ? (
            <BarChart
              data={data.principales_especies}
              title="Especies por Toneladas"
              description="Ranking de las 5 especies más importantes por volumen de extracción. Identifica los recursos pesqueros dominantes en la región y su importancia relativa en la actividad productiva."
              dataKey="especie"
              valueKey="toneladas"
            />
          ) : (
            <div className="no-data-message">
              <p>Sin datos de especies para esta región</p>
            </div>
          )}
        </div>

        {/* Tarjeta de Resumen */}
        <div className="summary-card chart-half">
          <h3>📋 Resumen Regional</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Región:</span>
              <span className="summary-value">{getNombreRegion(region)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Cosecha Total:</span>
              <span className="summary-value">{(data.kpis?.totalCosechado || 0).toLocaleString()} ton</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Procesamiento:</span>
              <span className="summary-value">{(data.kpis?.totalProcesado || 0).toLocaleString()} ton</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Eficiencia:</span>
              <span className="summary-value">
                {data.kpis?.totalCosechado > 0
                  ? ((data.kpis.totalProcesado / data.kpis.totalCosechado) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Especies Principales:</span>
              <span className="summary-value">{data.principales_especies?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanoramaRegional;
