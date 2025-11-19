import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './DonutChart.css';

const COLORS = {
  'Industrial': '#2563eb',
  'Artesanal': '#16a34a',
  'Otro': '#d97706',
  'INDUSTRIAL': '#2563eb',
  'ARTESANAL': '#16a34a'
};

function DonutChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">
            {payload[0].value.toLocaleString()} ton ({payload[0].payload.porcentaje}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="donut-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="toneladas"
            nameKey="tipo_agente"
            label={({ porcentaje }) => `${porcentaje}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.tipo_agente] || COLORS['Otro']} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => `${value} (${entry.payload.porcentaje}%)`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DonutChart;
