import { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardPlanta.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function DashboardPlanta({ region }) {
  const [plantas, setPlantas] = useState([]);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState('');
  const [datosPlanta, setDatosPlanta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar lista de plantas al montar o cambiar región
  useEffect(() => {
    cargarPlantas();
  }, [region]);

  const cargarPlantas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/explorador`, {
        params: { tipo_dato: 'plantas', region }
      });
      
      if (response.data.success && response.data.registros) {
        // Extraer plantas únicas
        const plantasUnicas = [...new Set(response.data.registros.map(r => r.planta))]
          .filter(Boolean)
          .sort();
        setPlantas(plantasUnicas);
        if (plantasUnicas.length > 0) {
          setPlantaSeleccionada(plantasUnicas[0]);
        }
      }
    } catch (err) {
      console.error('Error cargando plantas:', err);
    }
  };

  // Cargar datos cuando cambia la planta seleccionada
  useEffect(() => {
    if (plantaSeleccionada) {
      cargarDatosPlanta();
    }
  }, [plantaSeleccionada, region]);

  const cargarDatosPlanta = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar datos de producción (materia prima)
      const [produccion, cosechas] = await Promise.all([
        axios.get(`${API_BASE_URL}/explorador`, {
          params: { tipo_dato: 'produccion', region }
        }),
        axios.get(`${API_BASE_URL}/explorador`, {
          params: { tipo_dato: 'cosechas', region }
        })
      ]);

      // Filtrar por planta seleccionada
      const datosProduccionPlanta = produccion.data.registros?.filter(
        r => r.planta === plantaSeleccionada
      ) || [];

      // Calcular métricas
      const totalMateriaPrima = datosProduccionPlanta.reduce((sum, r) => sum + (r.toneladas_mp || 0), 0);
      const totalProduccion = datosProduccionPlanta.reduce((sum, r) => sum + (r.toneladas_elaboradas || 0), 0);

      // Especies procesadas
      const especiesProcesadas = [...new Set(datosProduccionPlanta.map(r => r.especie).filter(Boolean))];

      // Agrupar por año
      const produccionPorAnio = {};
      datosProduccionPlanta.forEach(registro => {
        const anio = registro.año;
        if (!produccionPorAnio[anio]) {
          produccionPorAnio[anio] = { materiaPrima: 0, produccion: 0 };
        }
        produccionPorAnio[anio].materiaPrima += registro.toneladas_mp || 0;
        produccionPorAnio[anio].produccion += registro.toneladas_elaboradas || 0;
      });

      // Agrupar por mes (promedio de todos los años)
      const produccionPorMes = {};
      datosProduccionPlanta.forEach(registro => {
        const mes = registro.mes;
        if (!produccionPorMes[mes]) {
          produccionPorMes[mes] = { materiaPrima: 0, produccion: 0, count: 0 };
        }
        produccionPorMes[mes].materiaPrima += registro.toneladas_mp || 0;
        produccionPorMes[mes].produccion += registro.toneladas_elaboradas || 0;
        produccionPorMes[mes].count++;
      });

      // Top especies
      const especiesStats = {};
      datosProduccionPlanta.forEach(registro => {
        const especie = registro.especie;
        if (!especiesStats[especie]) {
          especiesStats[especie] = 0;
        }
        especiesStats[especie] += registro.toneladas_mp || 0;
      });

      const topEspecies = Object.entries(especiesStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([especie, toneladas]) => ({ especie, toneladas }));

      setDatosPlanta({
        nombre: plantaSeleccionada,
        totalMateriaPrima: Math.round(totalMateriaPrima),
        totalProduccion: Math.round(totalProduccion),
        numeroEspecies: especiesProcesadas.length,
        rendimiento: totalMateriaPrima > 0 ? ((totalProduccion / totalMateriaPrima) * 100).toFixed(1) : 0,
        produccionPorAnio: Object.entries(produccionPorAnio)
          .sort(([a], [b]) => a - b)
          .map(([anio, datos]) => ({ anio: parseInt(anio), ...datos })),
        produccionPorMes: Object.entries(produccionPorMes)
          .sort(([a], [b]) => a - b)
          .map(([mes, datos]) => ({
            mes: parseInt(mes),
            materiaPrima: Math.round(datos.materiaPrima / datos.count),
            produccion: Math.round(datos.produccion / datos.count)
          })),
        topEspecies
      });

    } catch (err) {
      console.error('Error cargando datos de la planta:', err);
      setError('Error al cargar los datos de la planta. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  if (loading) {
    return (
      <div className="dashboard-planta">
        <p className="loading">⏳ Cargando datos de la planta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-planta">
        <div className="error-box">
          <p>❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-planta">
      <div className="header-planta">
        <h2>🏭 Dashboard por Planta</h2>
        <p>Análisis detallado de producción y procesamiento</p>
      </div>

      <div className="selector-planta">
        <label htmlFor="planta-select">Seleccionar Planta:</label>
        <select
          id="planta-select"
          value={plantaSeleccionada}
          onChange={(e) => setPlantaSeleccionada(e.target.value)}
        >
          {plantas.map(planta => (
            <option key={planta} value={planta}>{planta}</option>
          ))}
        </select>
      </div>

      {datosPlanta && (
        <>
          <div className="kpis-planta">
            <div className="kpi-card-planta">
              <div className="kpi-icon">📦</div>
              <div className="kpi-content">
                <h3>Materia Prima Total</h3>
                <p className="kpi-value">{datosPlanta.totalMateriaPrima.toLocaleString()}</p>
                <span className="kpi-label">toneladas procesadas</span>
              </div>
            </div>

            <div className="kpi-card-planta">
              <div className="kpi-icon">🏭</div>
              <div className="kpi-content">
                <h3>Producción Total</h3>
                <p className="kpi-value">{datosPlanta.totalProduccion.toLocaleString()}</p>
                <span className="kpi-label">toneladas elaboradas</span>
              </div>
            </div>

            <div className="kpi-card-planta">
              <div className="kpi-icon">📊</div>
              <div className="kpi-content">
                <h3>Rendimiento</h3>
                <p className="kpi-value">{datosPlanta.rendimiento}%</p>
                <span className="kpi-label">eficiencia de conversión</span>
              </div>
            </div>

            <div className="kpi-card-planta">
              <div className="kpi-icon">🐟</div>
              <div className="kpi-content">
                <h3>Especies Procesadas</h3>
                <p className="kpi-value">{datosPlanta.numeroEspecies}</p>
                <span className="kpi-label">tipos diferentes</span>
              </div>
            </div>
          </div>

          <div className="graficos-planta">
            <div className="grafico-container">
              <h3>📈 Evolución Anual</h3>
              <div className="chart-wrapper">
                {datosPlanta.produccionPorAnio.map(({ anio, materiaPrima, produccion }) => {
                  const maxVal = Math.max(...datosPlanta.produccionPorAnio.map(d => Math.max(d.materiaPrima, d.produccion)));
                  return (
                    <div key={anio} className="bar-group">
                      <div className="bars">
                        <div
                          className="bar bar-materia"
                          style={{ height: `${(materiaPrima / maxVal) * 100}%` }}
                          title={`Materia Prima: ${materiaPrima.toLocaleString()} ton`}
                        />
                        <div
                          className="bar bar-produccion"
                          style={{ height: `${(produccion / maxVal) * 100}%` }}
                          title={`Producción: ${produccion.toLocaleString()} ton`}
                        />
                      </div>
                      <div className="bar-label">{anio}</div>
                    </div>
                  );
                })}
              </div>
              <div className="legend">
                <span className="legend-item"><span className="legend-color materia"></span> Materia Prima</span>
                <span className="legend-item"><span className="legend-color produccion"></span> Producción</span>
              </div>
            </div>

            <div className="grafico-container">
              <h3>📅 Distribución Mensual (Promedio)</h3>
              <div className="chart-wrapper">
                {datosPlanta.produccionPorMes.map(({ mes, materiaPrima, produccion }) => {
                  const maxVal = Math.max(...datosPlanta.produccionPorMes.map(d => Math.max(d.materiaPrima, d.produccion)));
                  return (
                    <div key={mes} className="bar-group">
                      <div className="bars">
                        <div
                          className="bar bar-materia"
                          style={{ height: `${(materiaPrima / maxVal) * 100}%` }}
                          title={`Materia Prima: ${materiaPrima.toLocaleString()} ton`}
                        />
                        <div
                          className="bar bar-produccion"
                          style={{ height: `${(produccion / maxVal) * 100}%` }}
                          title={`Producción: ${produccion.toLocaleString()} ton`}
                        />
                      </div>
                      <div className="bar-label">{mesesNombres[mes - 1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="especies-planta">
            <h3>🐟 Top 5 Especies Procesadas</h3>
            <div className="especies-lista">
              {datosPlanta.topEspecies.map(({ especie, toneladas }, index) => (
                <div key={especie} className="especie-item">
                  <span className="especie-rank">#{index + 1}</span>
                  <span className="especie-nombre">{especie}</span>
                  <span className="especie-valor">{toneladas.toLocaleString()} ton</span>
                  <div className="especie-bar">
                    <div
                      className="especie-bar-fill"
                      style={{
                        width: `${(toneladas / datosPlanta.topEspecies[0].toneladas) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
