import React, { useState, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts';
import { calculateValue, formatCurrency, getAxisFormatter } from '../utils/economicCalculator';

const ForecastChart = ({ species, region, viewMode }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);
    const [showEducation, setShowEducation] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!species) return;

            setLoading(true);
            setError(null);
            setUsingFallback(false);

            try {
                const response = await fetch('/data/all_predictions.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const jsonData = await response.json();

                // Select Species Data
                const speciesData = jsonData[species];
                if (!speciesData) {
                    throw new Error(`No hay predicciones disponibles para ${species}`);
                }

                // Select Region Data (or Fallback to TODAS)
                let selectedData = speciesData[region];
                if (!selectedData) {
                    // Try fallback
                    if (speciesData['TODAS']) {
                        selectedData = speciesData['TODAS'];
                        setUsingFallback(true);
                    } else {
                        const firstKey = Object.keys(speciesData)[0];
                        if (firstKey) {
                            selectedData = speciesData[firstKey];
                            setUsingFallback(true);
                        } else {
                            throw new Error(`No hay datos para ${species}`);
                        }
                    }
                }

                // Process data for Recharts
                let processedData = selectedData.map(item => ({
                    ...item,
                    historyValue: item.type === 'history' ? item.value : null,
                    predictionValue: item.type === 'prediction' ? item.value : null
                }));

                // Bridge the gap between history and prediction
                const lastHistoryIndex = processedData.findLastIndex(item => item.type === 'history');
                if (lastHistoryIndex !== -1 && lastHistoryIndex < processedData.length - 1) {
                    processedData[lastHistoryIndex].predictionValue = processedData[lastHistoryIndex].historyValue;
                }

                setData(processedData);
            } catch (err) {
                console.error("Error fetching forecast data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [species, region]);

    // Transform data if viewMode is USD
    const chartData = React.useMemo(() => {
        if (viewMode !== 'USD') return data;
        return data.map(item => ({
            ...item,
            historyValue: item.historyValue ? calculateValue(species, item.historyValue) : null,
            predictionValue: item.predictionValue ? calculateValue(species, item.predictionValue) : null
        }));
    }, [data, viewMode, species]);

    // Format date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    };

    // Generate insight based on 2024 vs 2026 comparison
    const generateInsight = () => {
        if (!data || data.length === 0) return null;

        const data2024 = data.filter(d => d.date && d.date.startsWith('2024'));
        const data2026 = data.filter(d => d.date && d.date.startsWith('2026'));

        if (data2024.length === 0 || data2026.length === 0) return null;

        const avg2024 = data2024.reduce((sum, item) => sum + (item.historyValue || item.value || 0), 0) / data2024.length;
        const avg2026 = data2026.reduce((sum, item) => sum + (item.predictionValue || item.value || 0), 0) / data2026.length;

        if (avg2026 > avg2024) {
            return {
                type: 'positive',
                title: '📈 Tendencia Positiva',
                text: 'El modelo proyecta un crecimiento en la disponibilidad del recurso para los próximos 24 meses.'
            };
        } else {
            return {
                type: 'negative',
                title: '📉 Tendencia a la Baja',
                text: 'Se anticipa una contracción en los volúmenes de cosecha. Se recomienda planificar con cautela.'
            };
        }
    };

    const insight = generateInsight();

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isUSD = viewMode === 'USD';
            const unit = isUSD ? '' : ' Ton';
            const formatter = isUSD ? formatCurrency : (val) => val.toLocaleString('es-CL');

            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 100 }}>
                    <p className="font-bold mb-2">{formatDate(label)}</p>
                    {payload.map((entry, index) => {
                        if (entry.dataKey === 'historyValue' && entry.value !== null) {
                            return (
                                <p key={index} style={{ color: entry.color }}>
                                    {isUSD ? '💰 Valor Real:' : 'Captura Real:'} {formatter(entry.value)}{unit}
                                </p>
                            );
                        }
                        if (entry.dataKey === 'predictionValue' && entry.value !== null) {
                            return (
                                <p key={index} style={{ color: entry.color }}>
                                    {isUSD ? '💰 Proyección IA:' : 'Proyección IA:'} {formatter(entry.value)}{unit}
                                </p>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="p-4 text-center">Cargando proyección...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Nota: {error}</div>;
    if (!chartData || chartData.length === 0) return null;

    return (
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Proyección de Cosecha: {species}
                </h3>
                <p className="text-sm text-gray-500">
                    {usingFallback
                        ? `Mostrando proyección NACIONAL (No hay modelo específico para ${region})`
                        : `Modelo específico para región: ${region}`}
                </p>
            </div>

            <ResponsiveContainer width="100%" height={500}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        minTickGap={30}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={getAxisFormatter(viewMode)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="historyValue"
                        name="Historia"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="predictionValue"
                        name="Proyección IA"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                    />

                    <Brush
                        dataKey="date"
                        height={30}
                        stroke="#8884d8"
                        tickFormatter={formatDate}
                        startIndex={Math.max(0, chartData.length - 48)}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Insight Automático */}
            {insight && (
                <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    backgroundColor: insight.type === 'positive' ? '#f0fdf4' : '#fef2f2',
                    borderLeft: `4px solid ${insight.type === 'positive' ? '#10b981' : '#ef4444'}`,
                    borderRadius: '0 8px 8px 0'
                }}>
                    <h4 style={{
                        margin: '0 0 8px 0',
                        color: '#1e293b',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {insight.title}
                    </h4>
                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '14px' }}>
                        {insight.text}
                    </p>
                </div>
            )}

            {/* Sección Educativa Colapsable */}
            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                    onClick={() => setShowEducation(!showEducation)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '0'
                    }}
                >
                    <span>{showEducation ? '🔽' : '▶️'}</span>
                    <span>¿Cómo funciona esta predicción?</span>
                </button>

                {showEducation && (
                    <div style={{
                        marginTop: '12px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👁️</div>
                            <strong style={{ color: '#334155', fontSize: '13px' }}>Mira el Pasado</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                El sistema analizó 24 años de historia para entender el comportamiento de la especie.
                            </p>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌊</div>
                            <strong style={{ color: '#334155', fontSize: '13px' }}>Encuentra el Ritmo</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                Detectó los ciclos naturales: cuándo sube y baja la cosecha según la temporada.
                            </p>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
                            <strong style={{ color: '#334155', fontSize: '13px' }}>Dibuja el Futuro</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                Proyecta los próximos 24 meses siguiendo esos patrones matemáticos.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForecastChart;
