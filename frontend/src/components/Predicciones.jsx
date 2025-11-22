import React, { useState, useEffect } from 'react';
import ForecastChart from './ForecastChart';
import './Predicciones.css'; // We'll create this CSS file too

const Predicciones = ({ region }) => {
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const response = await fetch('/data/all_predictions.json');
                if (!response.ok) throw new Error('Error loading predictions');
                const data = await response.json();
                const keys = Object.keys(data);
                setSpeciesList(keys);
                if (keys.length > 0) {
                    setSelectedSpecies(keys[0]);
                }
            } catch (error) {
                console.error("Error loading species list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecies();
    }, []);

    return (
        <div className="predicciones-container">
            {/* Sección 1: Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Proyecciones de Cosecha 2025-2026</h1>
                    <p className="hero-subtitle">Análisis predictivo basado en Machine Learning (Modelo Prophet)</p>

                    <div className="methodology-card">
                        <h3>Metodología & Alcance</h3>
                        <div className="methodology-grid">
                            <div className="methodology-item">
                                <span className="icon">📅</span>
                                <p><strong>Historia:</strong> 24 años analizados para detectar estacionalidad.</p>
                            </div>
                            <div className="methodology-item">
                                <span className="icon">🔮</span>
                                <p><strong>Proyección:</strong> 24 meses (Ene 2025 - Dic 2026).</p>
                            </div>
                            <div className="methodology-item">
                                <span className="icon">📊</span>
                                <p><strong>Selección:</strong> Priorización automática por volumen histórico.</p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Sección 2: Selector de Especies */}
            <div className="species-selector-section">
                <h2 className="section-title">Selecciona una Especie</h2>
                {loading ? (
                    <div className="loading-skeleton">Cargando especies...</div>
                ) : (
                    <div className="chips-container">
                        {speciesList.map(species => (
                            <button
                                key={species}
                                className={`species-chip ${selectedSpecies === species ? 'active' : ''}`}
                                onClick={() => setSelectedSpecies(species)}
                            >
                                {species}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sección 3: Visualización */}
            <div className="chart-section">
                {selectedSpecies && (
                    <ForecastChart species={selectedSpecies} region={region} />
                )}
            </div>
        </div>
    );
};

export default Predicciones;
