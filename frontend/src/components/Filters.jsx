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
    'Arica y Parinacota',
    'Ñuble'
  ];

  // Estado para opciones de especies
  const [speciesOptions, setSpeciesOptions] = React.useState([]);
  const [loadingSpecies, setLoadingSpecies] = React.useState(false);

  // Efecto para cargar especies cuando cambia la región
  React.useEffect(() => {
    const fetchSpecies = async () => {
      setLoadingSpecies(true);
      try {
        const regionParam = filters.region ? `?region=${encodeURIComponent(filters.region)}` : '';
        const response = await fetch(`/api/data/options/species${regionParam}`);
        const result = await response.json();

        if (result.success) {
          setSpeciesOptions(result.data);

          // Si la especie seleccionada ya no está disponible, resetearla
          if (filters.especie && !result.data.includes(filters.especie)) {
            onFilterChange({
              ...filters,
              especie: null
            });
          }
        }
      } catch (error) {
        console.error('Error cargando especies:', error);
      } finally {
        setLoadingSpecies(false);
      }
    };

    fetchSpecies();
  }, [filters.region]);

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
          <label htmlFor="especie-select">Especie</label>
          <select
            id="especie-select"
            value={filters.especie || ''}
            onChange={handleEspecieChange}
            className="filter-select"
            disabled={loadingSpecies}
          >
            <option value="">Todas las especies</option>
            {speciesOptions.map(specie => (
              <option key={specie} value={specie}>{specie}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
