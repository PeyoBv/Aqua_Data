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
          <p className="tooltip-label" style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ 
              color: entry.color, 
              fontWeight: entry.name.includes('2024') || entry.name.includes('Año') ? 'bold' : 'normal',
              fontSize: '13px',
              marginBottom: '4px'
            }}>
              {entry.name}: <strong>{entry.value.toLocaleString()}</strong> ton
            </p>
          ))}
          {payload.length === 2 && (
            <p className="tooltip-diff" style={{ 
              borderTop: '1px solid #ccc', 
              paddingTop: '6px', 
              marginTop: '6px',
              fontWeight: 'bold',
              color: payload[0].value > payload[1].value ? '#10b981' : '#ef4444'
            }}>
              Diferencia: {(payload[0].value - payload[1].value > 0 ? '+' : '')}
              {(payload[0].value - payload[1].value).toLocaleString()} ton
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
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '12px',
        fontSize: '13px',
        color: '#475569'
      }}>
        <strong>📊 ¿Qué es el Promedio Histórico?</strong> Es el promedio mensual calculado con todos los años disponibles (2000-2024). 
        Permite comparar el desempeño del año seleccionado contra el comportamiento histórico típico.
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
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
            tick={{ fontSize: 13, fontWeight: 500 }}
            height={60}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Toneladas', angle: -90, position: 'insideLeft', style: { fontWeight: 600 } }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '15px', fontSize: '14px', fontWeight: 500 }}
            iconType="line"
            iconSize={20}
          />
          
          {/* Líneas dinámicas */}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 3}
              strokeDasharray={line.dashed ? "8 4" : "0"}
              name={line.name}
              dot={{ 
                r: line.dotSize || 5, 
                fill: line.color,
                strokeWidth: 2,
                stroke: '#fff'
              }}
              activeDot={{ r: 8, strokeWidth: 2 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MultiLineChart;
