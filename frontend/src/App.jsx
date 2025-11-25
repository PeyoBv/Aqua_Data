import React, { useState, useEffect } from 'react';
import PanoramaRegional from './components/PanoramaRegional';
import ExploradorDatos from './components/ExploradorDatos';
import Comparador from './components/Comparador';
import Predicciones from './components/Predicciones';
import './App.css';

function App() {
  // Estado global del selector de región
  const [regionSeleccionada, setRegionSeleccionada] = useState('LAGOS');

  // Estado para cambiar entre vistas
  const [vistaActual, setVistaActual] = useState('panorama'); // 'panorama', 'explorador', 'comparador', 'proyecciones'

  // Estado global para modo de visualización (Toneladas vs USD)
  const [viewMode, setViewMode] = useState('TONS'); // 'TONS' | 'USD'

  return (
    <div className="app">
      {/* Header con selector global de región */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <h1>🐟 Aqua-Data PM</h1>
            <p className="subtitle">Macro-Zona Sur · Sistema de Análisis Pesquero</p>
          </div>

          <div className="header-controls">

            {/* Toggle Toneladas / USD */}
            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${viewMode === 'TONS' ? 'active' : ''}`}
                onClick={() => setViewMode('TONS')}
                title="Ver en Toneladas"
              >
                ⚖️ Ton
              </button>
              <button
                className={`toggle-btn ${viewMode === 'USD' ? 'active' : ''}`}
                onClick={() => setViewMode('USD')}
                title="Ver en Valor Económico (USD)"
              >
                💵 USD
              </button>
            </div>

            <div className="region-selector-global">
              <label htmlFor="region-global">Región:</label>
              <select
                id="region-global"
                value={regionSeleccionada}
                onChange={(e) => setRegionSeleccionada(e.target.value)}
                className="select-region"
              >
                <option value="LAGOS">Región de Los Lagos</option>
                <option value="AYSEN">Región de Aysén</option>
                <option value="MAGALLANES">Región de Magallanes</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación entre vistas */}
      <nav className="view-navigation">
        <button
          className={`nav-button ${vistaActual === 'panorama' ? 'active' : ''}`}
          onClick={() => setVistaActual('panorama')}
        >
          📊 Panorama Regional
        </button>
        <button
          className={`nav-button ${vistaActual === 'explorador' ? 'active' : ''}`}
          onClick={() => setVistaActual('explorador')}
        >
          🔍 Explorador de Datos
        </button>
        <button
          className={`nav-button ${vistaActual === 'comparador' ? 'active' : ''}`}
          onClick={() => setVistaActual('comparador')}
        >
          🔄 Comparador
        </button>
        <button
          className={`nav-button ${vistaActual === 'proyecciones' ? 'active' : ''}`}
          onClick={() => setVistaActual('proyecciones')}
        >
          📈 Proyecciones
        </button>
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        {vistaActual === 'panorama' && (
          <PanoramaRegional region={regionSeleccionada} viewMode={viewMode} />
        )}
        {vistaActual === 'explorador' && (
          <ExploradorDatos region={regionSeleccionada} viewMode={viewMode} />
        )}
        {vistaActual === 'comparador' && (
          <Comparador region={regionSeleccionada} viewMode={viewMode} />
        )}
        {vistaActual === 'proyecciones' && (
          <Predicciones region={regionSeleccionada} viewMode={viewMode} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Aqua-Data PM v2.0 · Datos Macro-Zona Sur de Chile</p>
      </footer>
    </div>
  );
}

export default App;
