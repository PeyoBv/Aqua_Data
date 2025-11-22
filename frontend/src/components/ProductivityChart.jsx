import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './ChartDescription.css';

/**
 * Gráfico de Productividad vs Plantas
 * Muestra la relación entre la capacidad instalada (N° Plantas) y la eficiencia (Ton/Planta)
 */
const ProductivityChart = ({ data, title, description }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No hay datos disponibles para el análisis de productividad.</p>
            </div>
        );
    }

    // Procesar datos: Calcular Productividad (Ton / Planta)
    const chartData = data.map(item => {
        const cosecha = item.cosechaTotal || 0;
        const plantas = item.capacidadPlantas || 0;
        const productividad = plantas > 0 ? Math.round(cosecha / plantas) : 0;

        return {
            ...item,
            productividad
        };
    });

    // Lógica de Insight Automático
    const generateInsight = () => {
        if (chartData.length < 2) return null;

        const firstYear = chartData[0];
        const lastYear = chartData[chartData.length - 1];

        const prodInicial = firstYear.productividad;
        const prodFinal = lastYear.productividad;

        if (prodInicial === 0) return null;

        const variacion = ((prodFinal - prodInicial) / prodInicial) * 100;
        const currentProd = prodFinal.toLocaleString('es-CL');

        if (variacion > 10) {
            return {
                type: 'positive',
                title: '📈 Consolidación Industrial',
                text: `Se observa una consolidación industrial. Aunque el número de plantas ha variado, la eficiencia operativa ha aumentado un ${variacion.toFixed(1)}%, alcanzando ${currentProd} Ton/Planta. Esto indica mayor tecnificación y aprovechamiento de la capacidad instalada.`
            };
        } else if (variacion < -10) {
            return {
                type: 'negative',
                title: '⚠️ Baja en Rendimiento',
                text: `Se detecta una baja en el rendimiento del ${Math.abs(variacion).toFixed(1)}%. Las plantas están procesando menos volumen promedio (${currentProd} Ton/Planta), lo que podría indicar escasez de recurso o sobrecapacidad instalada en la región.`
            };
        } else {
            return {
                type: 'neutral',
                title: '⚖️ Estabilidad Operativa',
                text: `La industria muestra un comportamiento estable entre capacidad instalada y procesamiento, manteniendo una productividad promedio de ${currentProd} Ton/Planta.`
            };
        }
    };

    const insight = generateInsight();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e293b' }}>Año {label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '13px' }}>
                            {entry.name}: <strong>{entry.value.toLocaleString('es-CL')} {entry.unit}</strong>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', marginBottom: '24px' }}>
            <h3 className="chart-title">{title}</h3>
            {description && <p className="chart-description">{description}</p>}

            <div style={{ width: '100%', height: 500 }}>
                <ResponsiveContainer>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="año"
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                        />

                        {/* Eje Y Izquierdo: Plantas */}
                        <YAxis
                            yAxisId="left"
                            stroke="#10b981"
                            label={{
                                value: 'N° Plantas Activas',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: '#10b981', fontSize: '12px' }
                            }}
                        />

                        {/* Eje Y Derecho: Productividad */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            label={{
                                value: 'Ton / Planta (Promedio)',
                                angle: 90,
                                position: 'insideRight',
                                style: { fill: '#3b82f6', fontSize: '12px' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />

                        <Bar
                            yAxisId="left"
                            dataKey="capacidadPlantas"
                            name="Plantas Activas"
                            fill="#10b981"
                            barSize={40}
                            radius={[4, 4, 0, 0]}
                            unit="unidades"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="productividad"
                            name="Productividad"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6' }}
                            activeDot={{ r: 6 }}
                            unit="Ton/Planta"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Insight Automático */}
            {insight && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: insight.type === 'positive' ? '#f0fdf4' : insight.type === 'negative' ? '#fef2f2' : '#f8fafc',
                    borderLeft: `4px solid ${insight.type === 'positive' ? '#10b981' : insight.type === 'negative' ? '#ef4444' : '#94a3b8'}`,
                    borderRadius: '0 8px 8px 0'
                }}>
                    <h4 style={{
                        margin: '0 0 8px 0',
                        color: '#1e293b',
                        fontSize: '16px',
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
        </div>
    );
};

export default ProductivityChart;
