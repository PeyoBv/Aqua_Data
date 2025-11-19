import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StackedBarChart.css';

const AGENT_COLORS = {
  'Industrial': '#2563eb',
  'Artesanal': '#16a34a',
  'INDUSTRIAL': '#2563eb',
  'ARTESANAL': '#16a34a',
  'Otro': '#d97706'
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
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="especie" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Toneladas', angle: -90, position: 'insideLeft' }}
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
