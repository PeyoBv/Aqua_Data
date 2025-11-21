import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ChartDescription.css';

/**
 * Componente de gráfico de área compuesto para Trazabilidad
 * Muestra Desembarque (área) vs Materia Prima (línea)
 */
const AreaLineChart = ({ data, title, description }) => {
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const desembarque = payload.find(p => p.dataKey === 'desembarque')?.value || 0;
      const materiaPrima = payload.find(p => p.dataKey === 'materiaPrima')?.value || 0;
      const brecha = desembarque - materiaPrima;
      const porcentaje = desembarque > 0 ? ((materiaPrima / desembarque) * 100).toFixed(1) : 0;

      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e293b' }}>
            Año {payload[0].payload.año}
          </p>
          <p style={{ margin: '4px 0', color: '#3b82f6', fontSize: '13px' }}>
            🎣 Desembarque: <strong>{desembarque.toLocaleString('es-CL')} ton</strong>
          </p>
          <p style={{ margin: '4px 0', color: '#10b981', fontSize: '13px' }}>
            🏭 Materia Prima: <strong>{materiaPrima.toLocaleString('es-CL')} ton</strong>
          </p>
          <p style={{ margin: '8px 0 4px 0', color: '#64748b', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
            📊 Procesado: <strong>{porcentaje}%</strong>
          </p>
          <p style={{ margin: '4px 0', color: '#f59e0b', fontSize: '12px' }}>
            ⚠️ Brecha: <strong>{brecha.toLocaleString('es-CL')} ton</strong>
          </p>
        </div>
      );
    }
    return null;
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
          height: '400px',
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
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="año" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
          />
          
          {/* Área de Desembarque (Oferta) */}
          <Area
            type="monotone"
            dataKey="desembarque"
            name="Desembarque Total"
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#3b82f6"
            strokeWidth={2}
          />
          
          {/* Línea de Materia Prima (Demanda Industrial) */}
          <Line
            type="monotone"
            dataKey="materiaPrima"
            name="Materia Prima en Plantas"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AreaLineChart;
