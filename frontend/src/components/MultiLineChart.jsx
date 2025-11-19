import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import './MultiLineChart.css';

function MultiLineChart({ data, title, lines = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-multi">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} ton
            </p>
          ))}
          {payload.length === 2 && (
            <p className="tooltip-diff">
              Diferencia: {(payload[0].value - payload[1].value).toLocaleString()} ton
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="multi-line-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorDiferencia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="mes_nombre" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Toneladas', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Área de diferencia (opcional) */}
          {lines.length === 2 && (
            <Area 
              type="monotone"
              dataKey="diferencia"
              fill="url(#colorDiferencia)"
              stroke="none"
              name="Diferencia"
              fillOpacity={0.3}
            />
          )}
          
          {/* Líneas dinámicas */}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.dashed ? "5 5" : "0"}
              name={line.name}
              dot={{ r: line.dotSize || 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MultiLineChart;
