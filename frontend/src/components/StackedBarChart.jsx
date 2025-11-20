import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StackedBarChart.css';

const AGENT_COLORS = {
  'ACUICULTURA': '#f97316',  // Naranja
  'ARTESANAL': '#10b981',     // Verde
  'FABRICA': '#f59e0b',       // Amarillo/Naranja
  'INDUSTRIAL': '#3b82f6',    // Azul
  'Industrial': '#3b82f6',
  'Artesanal': '#10b981',
  'Otro': '#94a3b8'           // Gris
};

function StackedBarChart({ data, title, agentTypes = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="custom-tooltip-stacked">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} ton
            </p>
          ))}
          <p className="tooltip-total">Total: {total.toLocaleString()} ton</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stacked-bar-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 50, left: 200, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number"
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Toneladas', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="category"
            dataKey="especie"
            width={180}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => value}
          />
          {agentTypes.map((agent, index) => (
            <Bar 
              key={agent}
              dataKey={agent} 
              stackId="a" 
              fill={AGENT_COLORS[agent] || AGENT_COLORS['Otro']}
              name={agent}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StackedBarChart;
