import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './GroupedBarChart.css';
import './ChartDescription.css';

/**
 * GroupedBarChart - Gráfico de barras agrupadas para comparar 2 series
 * Ideal para Balance de Masas (Materia Prima vs Producción)
 */
function GroupedBarChart({ 
  data = [], 
  title = 'Gráfico de Barras Agrupadas',
  description,
  bar1Key = 'value1',
  bar1Name = 'Serie 1',
  bar1Color = '#3b82f6',
  bar2Key = 'value2',
  bar2Name = 'Serie 2',
  bar2Color = '#10b981',
  xKey = 'name',
  height = 400
}) {
  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <div className="grouped-bar-chart no-data">
        <h3>{title}</h3>
        <p className="no-data-message">No hay datos disponibles</p>
      </div>
    );
  }

  // Formatear números grandes
  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Año: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString('es-CL')} ton`}
            </p>
          ))}
          {payload.length === 2 && (
            <p className="efficiency">
              {`Rendimiento: ${((payload[1].value / payload[0].value) * 100).toFixed(1)}%`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grouped-bar-chart">
      <h3>{title}</h3>
      {description && <p className="chart-description">{description}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} 
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#6b7280"
            tickFormatter={formatNumber}
            style={{ fontSize: '14px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey={bar1Key} 
            name={bar1Name} 
            fill={bar1Color}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey={bar2Key} 
            name={bar2Name} 
            fill={bar2Color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GroupedBarChart;
