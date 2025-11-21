import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './DonutChart.css';
import './ChartDescription.css';

const COLORS = {
  'Industrial': '#2563eb',
  'Artesanal': '#16a34a',
  'Otro': '#d97706',
  'INDUSTRIAL': '#2563eb',
  'ARTESANAL': '#16a34a'
};

function DonutChart({ data, title, description }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  // Calcular porcentajes y filtrar datos con 0.0%
  const total = data.reduce((sum, item) => sum + (item.value || item.toneladas || 0), 0);
  const dataWithPercentage = data
    .map(item => ({
      ...item,
      porcentaje: total > 0 ? ((item.value || item.toneladas || 0) / total * 100).toFixed(1) : 0
    }))
    .filter(item => parseFloat(item.porcentaje) > 0);

  // Generar colores dinámicamente
  const generateColor = (index) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
      '#6366f1', '#d946ef', '#0ea5e9', '#f43f5e', '#22c55e',
      '#a855f7'
    ];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value || 0;
      const name = payload[0].name || 'Sin nombre';
      const porcentaje = payload[0].payload.porcentaje || 0;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{name}</p>
          <p className="tooltip-value">
            {value.toLocaleString('es-CL')} ton ({porcentaje}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="donut-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      {description && <p className="chart-description">{description}</p>}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ porcentaje }) => `${porcentaje}%`}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={generateColor(index)} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={60}
            formatter={(value, entry) => `${value}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DonutChart;
