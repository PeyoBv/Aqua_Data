import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ChartDescription.css';

/**
 * Componente de gráfico de áreas apiladas (Stacked Area Chart)
 * Para mostrar la evolución del destino industrial por línea de elaboración
 */
const StackedAreaChart = ({ data, lineas, title, description }) => {
  
  // Paleta de colores distintivos para cada línea de elaboración
  const COLORES = {
    'HARINA': '#f59e0b',      // Ámbar
    'CONGELADO': '#3b82f6',   // Azul
    'CONSERVA': '#10b981',    // Verde
    'FRESCO REFRIGERADO': '#8b5cf6', // Púrpura
    'SECO SALADO': '#ef4444', // Rojo
    'OTROS': '#6b7280'        // Gris
  };

  const obtenerColor = (linea) => {
    return COLORES[linea] || COLORES['OTROS'];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const año = payload[0].payload.año;
      const total = payload.reduce((sum, item) => sum + (item.value || 0), 0);

      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '14px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          minWidth: '200px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>
            📅 Año {año}
          </p>
          {payload
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <p key={index} style={{ 
                margin: '5px 0', 
                color: entry.color, 
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <span>{entry.name}:</span>
                <strong>{entry.value.toLocaleString('es-CL')} ton</strong>
              </p>
            ))}
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#1e293b', 
            fontSize: '13px', 
            fontWeight: 'bold',
            borderTop: '1px solid #e2e8f0', 
            paddingTop: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Total:</span>
            <span>{total.toLocaleString('es-CL')} ton</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Formatear nombres de líneas para la leyenda
  const formatearNombreLinea = (linea) => {
    return linea
      .split(' ')
      .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
      .join(' ');
  };

  // Verificar si hay datos para renderizar
  const hasData = data && data.length > 0;

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <h3 className="chart-title">{title}</h3>
      {description && <p className="chart-description">{description}</p>}
      
      {!hasData ? (
        <div style={{
          width: '100%',
          height: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '64px',
            opacity: 0.3,
            filter: 'grayscale(100%)'
          }}>
            🏭
          </div>
          <div style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '15px',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600, fontSize: '16px', color: '#475569' }}>
              No se registran procesos industriales
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Esta especie no cuenta con registros de procesamiento industrial en el período seleccionado.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="año" 
            stroke="#64748b"
            style={{ fontSize: '12px', fontWeight: 500 }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
            label={{ 
              value: 'Producción (ton)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#64748b' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '15px' }}
            iconType="rect"
            formatter={formatearNombreLinea}
          />
          
          {/* Renderizar áreas para cada línea de elaboración */}
          {lineas && lineas.map((linea, index) => (
            <Area
              key={linea}
              type="monotone"
              dataKey={linea}
              name={linea}
              stackId="1"
              fill={obtenerColor(linea)}
              stroke={obtenerColor(linea)}
              fillOpacity={0.7}
              strokeWidth={1.5}
            />
          ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StackedAreaChart;
