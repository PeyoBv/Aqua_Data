import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StackedBarChart.css';
import './ChartDescription.css';

// Paleta de colores para líneas de producción
const LINEA_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#6366f1', '#a855f7', '#f43f5e', '#0ea5e9', '#22c55e',
  '#eab308'
];

function StackedBarChartHorizontal({ data, title, description, categories = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  // Generar mapeo de colores para categorías
  const colorMap = {};
  categories.forEach((cat, index) => {
    colorMap[cat] = LINEA_COLORS[index % LINEA_COLORS.length];
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      return (
        <div className="custom-tooltip-stacked">
          <p className="tooltip-label">Año {label}</p>
          {payload
            .filter(entry => entry.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <p key={index} className="tooltip-item" style={{ color: entry.color }}>
                {entry.name}: {entry.value.toLocaleString()} líneas
              </p>
            ))}
          <p className="tooltip-total">Total: {total.toLocaleString()} líneas</p>
          {label === 2012 && (
            <p className="tooltip-note" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
              ⚠️ Año 2012 con datos excepcionales
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stacked-bar-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      {description && <p className="chart-description">{description}</p>}
      <ResponsiveContainer width="100%" height={550}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 80, left: 80, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="año"
            label={{ value: 'Año', position: 'insideBottom', offset: -15 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Número de Líneas', angle: -90, position: 'insideLeft', offset: 10 }}
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => value}
            iconType="square"
          />
          {categories.map((categoria, index) => (
            <Bar 
              key={categoria}
              dataKey={categoria} 
              stackId="a" 
              fill={colorMap[categoria]}
              name={categoria}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StackedBarChartHorizontal;
