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
import { calculateValue, formatCurrency, getAxisFormatter } from '../utils/economicCalculator';
import './ChartDescription.css';

/**
 * Componente de gráfico de barras agrupadas para comparación regional
 * Muestra Captura vs Procesamiento por región
 */
const RegionalComparisonChart = ({ data, title, description, especie, viewMode }) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const captura = payload.find(p => p.dataKey === 'captura')?.value || 0;
      const procesamiento = payload.find(p => p.dataKey === 'procesamiento')?.value || 0;
      const porcentaje = captura > 0 ? ((procesamiento / captura) * 100).toFixed(1) : 0;
      const brecha = captura - procesamiento;

      const isUSD = viewMode === 'USD';
      const unit = isUSD ? '' : ' Ton';
      const formatter = isUSD ? formatCurrency : (val) => val.toLocaleString('es-CL');

      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '14px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          minWidth: '220px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>
            📍 {label}
          </p>
          <p style={{
            margin: '5px 0',
            color: '#3b82f6',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <span>{isUSD ? '💰 Valor Captura:' : '🎣 Captura:'}</span>
            <strong>{formatter(captura)}{unit}</strong>
          </p>
          <p style={{
            margin: '5px 0',
            color: '#f59e0b',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <span>{isUSD ? '💰 Valor Procesamiento:' : '🏭 Procesamiento:'}</span>
            <strong>{formatter(procesamiento)}{unit}</strong>
          </p>
          <div style={{
            margin: '10px 0 0 0',
            paddingTop: '8px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{
              margin: '4px 0',
              color: '#10b981',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>✅ Procesado:</span>
              <strong>{porcentaje}%</strong>
            </p>
            <p style={{
              margin: '4px 0',
              color: '#64748b',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{isUSD ? '💰 Valor Brecha:' : '📊 Brecha:'}</span>
              <strong>{formatter(brecha)}{unit}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <h3 className="chart-title">{title}</h3>
      {description && <p className="chart-description">{description}</p>}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={React.useMemo(() => {
            if (viewMode !== 'USD') return data;
            return data.map(item => ({
              ...item,
              captura: calculateValue(especie, item.captura),
              procesamiento: calculateValue(especie, item.procesamiento)
            }));
          }, [data, viewMode, especie])}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="region"
            stroke="#64748b"
            style={{ fontSize: '13px', fontWeight: 500 }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={getAxisFormatter(viewMode)}
            label={{
              value: viewMode === 'USD' ? 'Valor (USD)' : 'Toneladas',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#64748b' }
            }}
          />
          <Tooltip content={<CustomTooltip viewMode={viewMode} />} />
          <Legend
            wrapperStyle={{ paddingTop: '15px' }}
            iconType="rect"
          />

          {/* Barra de Captura (Azul) */}
          <Bar
            dataKey="captura"
            name="Captura Total"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
          />

          {/* Barra de Procesamiento (Naranja/Amarillo) */}
          <Bar
            dataKey="procesamiento"
            name="Procesamiento Industrial"
            fill="#f59e0b"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegionalComparisonChart;
