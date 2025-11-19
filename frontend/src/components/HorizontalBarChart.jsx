import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './HorizontalBarChart.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6', '#f97316', '#84cc16'];

function HorizontalBarChart({ data, title, dataKey = 'puerto', valueKey = 'toneladas' }) {
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
          <p className="tooltip-label">{payload[0].payload[dataKey]}</p>
          <p className="tooltip-value">
            {payload[0].value.toLocaleString()} toneladas
          </p>
          {payload[0].payload.ranking && (
            <p className="tooltip-ranking">Ranking: #{payload[0].payload.ranking}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="horizontal-bar-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis 
            type="category" 
            dataKey={dataKey} 
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={valueKey} radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HorizontalBarChart;
