import React from 'react';
import './Filters.css';

/**
 * Componente de filtros para año y región
 */
const Filters = ({ onFilterChange, filters }) => {
  // Años disponibles (2000-2024)
  const years = Array.from({ length: 25 }, (_, i) => 2000 + i);

  // Regiones de Chile
  const regions = [
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'O\'Higgins',
    'Maule',
    'Biobío',
    'La Araucanía',
    'Los Lagos',
    'Aysén',
    'Magallanes',
    'Metropolitana',
    'Los Ríos',
    'Arica y Parinacota',
    'Ñuble'
  ];

  const handleYearChange = (e) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      anio: value ? parseInt(value) : null
    });
  };

  const handleRegionChange = (e) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      region: value || null
    });
  };

  const handleEspecieChange = (e) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      especie: value || null
    });
  };

  const handleReset = () => {
    onFilterChange({
      anio: null,
      region: null,
      especie: null
    });
  };

  return (
    <div className="filters-container">
      <div className="filters-header">
        <h2>📊 Dashboard de Cosechas</h2>
        <button className="reset-button" onClick={handleReset}>
          🔄 Resetear Filtros
        </button>
      </div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="year-select">Año</label>
          <select
            id="year-select"
            value={filters.anio || ''}
            onChange={handleYearChange}
            className="filter-select"
          >
            <option value="">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="region-select">Región</label>
          <select
            id="region-select"
            value={filters.region || ''}
            onChange={handleRegionChange}
            className="filter-select"
          >
            <option value="">Todas las regiones</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="especie-input">Especie</label>
          <input
            id="especie-input"
            type="text"
            value={filters.especie || ''}
            onChange={handleEspecieChange}
            placeholder="Ej: Anchoveta, Jurel..."
            className="filter-input"
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
