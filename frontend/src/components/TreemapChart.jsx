import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import './TreemapChart.css';

const TreemapChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="treemap-chart-container">
        <h4>{title}</h4>
        <div className="no-data-message">
          <p>⚠️ No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Generar colores dinámicamente
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
    '#6366f1', '#a855f7', '#f43f5e', '#0ea5e9', '#22c55e',
    '#eab308'
  ];

  // Preparar datos para Treemap con colores
  const treemapData = data.map((item, index) => ({
    name: item.name,
    size: item.value,
    percentage: item.percentage || ((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1),
    fill: colors[index % colors.length]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="treemap-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            <strong>{data.size}</strong> plantas
          </p>
          <p className="tooltip-percentage">
            {data.percentage}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomContent = (props) => {
    const { x, y, width, height, name, size, percentage } = props;
    
    // No mostrar etiqueta si el área es muy pequeña
    if (width < 60 || height < 40) {
      return null;
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.fill,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 14 : 12}
          fontWeight="600"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 16 : 14}
          fontWeight="700"
        >
          {size}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 28}
          textAnchor="middle"
          fill="#fff"
          fontSize={11}
          opacity={0.9}
        >
          ({percentage}%)
        </text>
      </g>
    );
  };

  return (
    <div className="treemap-chart-container">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default TreemapChart;
