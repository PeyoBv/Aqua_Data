import React, { useState, useEffect } from 'react';
import PanoramaRegional from './components/PanoramaRegional';
import ExploradorDatos from './components/ExploradorDatos';
import './App.css';

function App() {
  // Estado global del selector de región
  const [regionSeleccionada, setRegionSeleccionada] = useState('LAGOS');
  
  // Estado para cambiar entre vistas
  const [vistaActual, setVistaActual] = useState('panorama'); // 'panorama' o 'explorador'

  return (
    <div className="app">
      {/* Header con selector global de región */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <h1>🐟 Aqua-Data PM</h1>
            <p className="subtitle">Macro-Zona Sur · Sistema de Análisis Pesquero</p>
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
      </nav>

      {/* Renderizar vista actual */}
      <main className="app-main">
        {vistaActual === 'panorama' ? (
          <PanoramaRegional region={regionSeleccionada} />
        ) : (
          <ExploradorDatos region={regionSeleccionada} />
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
