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

const ForecastChart = ({ species, region }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);

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
                        // Try to find any region? No, just fail if no national data.
                        // Or maybe pick the first available key?
                        const firstKey = Object.keys(speciesData)[0];
                        if (firstKey) {
                            selectedData = speciesData[firstKey];
                            setUsingFallback(true); // Still technically a fallback/mismatch
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

    if (loading) return <div className="p-4 text-center">Cargando proyección...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Nota: {error}</div>;
    if (!data || data.length === 0) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 100 }}>
                    <p className="font-bold mb-2">{formatDate(label)}</p>
                    {payload.map((entry, index) => {
                        if (entry.dataKey === 'historyValue' && entry.value !== null) {
                            return (
                                <p key={index} style={{ color: entry.color }}>
                                    Captura Real: {entry.value.toLocaleString('es-CL')} Ton
                                </p>
                            );
                        }
                        if (entry.dataKey === 'predictionValue' && entry.value !== null) {
                            return (
                                <p key={index} style={{ color: entry.color }}>
                                    Proyección IA: {entry.value.toLocaleString('es-CL')} Ton
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

    return (
        <div className="w-full h-[450px] bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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

            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
                    data={data}
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
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
                        startIndex={Math.max(0, data.length - 48)} // Show last 4 years by default
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ForecastChart;
