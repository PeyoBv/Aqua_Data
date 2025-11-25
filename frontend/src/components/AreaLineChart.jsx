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
import { calculateValue, formatCurrency, getAxisFormatter } from '../utils/economicCalculator';
import './ChartDescription.css';

/**
 * Componente de gráfico de área compuesto para Trazabilidad
 * Muestra Desembarque (área) vs Materia Prima (línea)
 */
const AreaLineChart = ({ data, title, description, viewMode, especie }) => {
  // Light mode colors only
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    grid: '#e2e8f0',
    text: '#64748b',
    tooltipBg: 'rgba(255, 255, 255, 0.96)',
    tooltipBorder: '#e2e8f0',
    tooltipText: '#1e293b'
  };

  // Transform data if viewMode is USD
  const chartData = React.useMemo(() => {
    if (viewMode !== 'USD') return data;
    return data.map(item => ({
      ...item,
      desembarque: calculateValue(especie, item.desembarque),
      materiaPrima: calculateValue(especie, item.materiaPrima)
    }));
  }, [data, viewMode, especie]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const desembarque = payload.find(p => p.dataKey === 'desembarque')?.value || 0;
      const materiaPrima = payload.find(p => p.dataKey === 'materiaPrima')?.value || 0;
      const brecha = desembarque - materiaPrima;
      const porcentaje = desembarque > 0 ? ((materiaPrima / desembarque) * 100).toFixed(1) : 0;

      const isUSD = viewMode === 'USD';
      const unit = isUSD ? '' : ' Ton';
      const formatter = isUSD ? formatCurrency : (val) => val.toLocaleString('es-CL');

      return (
        <div style={{
          backgroundColor: colors.tooltipBg,
          padding: '12px',
          border: `1px solid ${colors.tooltipBorder}`,
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: colors.tooltipText }}>
            Año {payload[0].payload.año}
          </p>
          <p style={{ margin: '4px 0', color: '#3b82f6', fontSize: '13px' }}>
            {isUSD ? '💰 Valor Desembarque:' : '🎣 Desembarque:'} <strong>{formatter(desembarque)}{unit}</strong>
          </p>
          <p style={{ margin: '4px 0', color: '#10b981', fontSize: '13px' }}>
            {isUSD ? '💰 Valor Materia Prima:' : '🏭 Materia Prima:'} <strong>{formatter(materiaPrima)}{unit}</strong>
          </p>
          <p style={{ margin: '8px 0 4px 0', color: '#64748b', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
            📊 Procesado: <strong>{porcentaje}%</strong>
          </p>
          <p style={{ margin: '4px 0', color: '#f59e0b', fontSize: '12px' }}>
            {isUSD ? '💰 Valor Brecha:' : '⚠️ Brecha:'} <strong>{formatter(brecha)}{unit}</strong>
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
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="año"
              stroke={colors.text}
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke={colors.text}
              style={{ fontSize: '12px' }}
              tickFormatter={getAxisFormatter(viewMode)}
              width={80}
            />
            <Tooltip content={<CustomTooltip viewMode={viewMode} especie={especie} />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />

            {/* Área de Desembarque (Oferta) */}
            <Area
              type="monotone"
              dataKey="desembarque"
              name="Desembarque Total"
              fill={colors.primary}
              fillOpacity={isDark ? 0.2 : 0.3}
              stroke={colors.primary}
              strokeWidth={2}
            />

            {/* Línea de Materia Prima (Demanda Industrial) */}
            <Line
              type="monotone"
              dataKey="materiaPrima"
              name="Materia Prima en Plantas"
              stroke={colors.secondary}
              strokeWidth={3}
              dot={{ fill: colors.secondary, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AreaLineChart;
