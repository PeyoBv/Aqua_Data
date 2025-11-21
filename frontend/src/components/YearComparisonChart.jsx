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
import './ChartDescription.css';

/**
 * Componente para comparación Year-over-Year (YoY)
 * Muestra barras comparativas entre dos años específicos
 * Incluye KPI de variación porcentual
 */
const YearComparisonChart = ({ data, yearA, yearB, especie }) => {
  
  // Validar datos
  if (!data || !data.dataYearA || !data.dataYearB) {
    return (
      <div style={{ width: '100%', padding: '20px' }}>
        <p className="chart-description">No hay datos disponibles para la comparación.</p>
      </div>
    );
  }

  const { dataYearA, dataYearB } = data;

  // ========================================
  // PREPARACIÓN DE DATOS PARA BARRAS AGRUPADAS
  // ========================================
  const chartData = [
    {
      categoria: 'Captura',
      [`${yearA}`]: Math.round(dataYearA.captura),
      [`${yearB}`]: Math.round(dataYearB.captura)
    },
    {
      categoria: 'Procesamiento',
      [`${yearA}`]: Math.round(dataYearA.procesamiento),
      [`${yearB}`]: Math.round(dataYearB.procesamiento)
    }
  ];

  // ========================================
  // CÁLCULO DE VARIACIONES YoY
  // ========================================
  const calcularVariacion = (valorA, valorB) => {
    if (valorA === 0) return valorB > 0 ? 100 : 0;
    return ((valorB - valorA) / valorA) * 100;
  };

  const variacionCaptura = calcularVariacion(dataYearA.captura, dataYearB.captura);
  const variacionProcesamiento = calcularVariacion(dataYearA.procesamiento, dataYearB.procesamiento);

  // ========================================
  // COLORES
  // ========================================
  const COLORS = {
    YEAR_A: '#94a3b8',      // Gris claro para año anterior
    YEAR_B: '#3b82f6',      // Azul principal para año actual
    POSITIVE: '#10b981',    // Verde para variaciones positivas
    NEGATIVE: '#ef4444'     // Rojo para variaciones negativas
  };

  // ========================================
  // TOOLTIP PERSONALIZADO
  // ========================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const valorA = payload[0]?.value || 0;
      const valorB = payload[1]?.value || 0;
      const variacion = calcularVariacion(valorA, valorB);

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
            📊 {label}
          </p>
          <p style={{ margin: '5px 0', color: COLORS.YEAR_A, fontSize: '13px' }}>
            <strong>{yearA}:</strong> {valorA.toLocaleString('es-CL')} ton
          </p>
          <p style={{ margin: '5px 0', color: COLORS.YEAR_B, fontSize: '13px' }}>
            <strong>{yearB}:</strong> {valorB.toLocaleString('es-CL')} ton
          </p>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: variacion >= 0 ? COLORS.POSITIVE : COLORS.NEGATIVE,
            fontSize: '13px',
            fontWeight: 'bold'
          }}>
            Variación: {variacion >= 0 ? '+' : ''}{variacion.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // ========================================
  // LABEL PERSONALIZADO CON VARIACIÓN
  // ========================================
  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props;
    
    // Solo mostrar en la segunda barra (yearB)
    if (index % 2 !== 1) return null;

    const categoria = index < 2 ? 'Captura' : 'Procesamiento';
    const valorA = categoria === 'Captura' ? dataYearA.captura : dataYearA.procesamiento;
    const valorB = categoria === 'Captura' ? dataYearB.captura : dataYearB.procesamiento;
    const variacion = calcularVariacion(valorA, valorB);

    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill={variacion >= 0 ? COLORS.POSITIVE : COLORS.NEGATIVE}
        textAnchor="middle"
        fontSize="13px"
        fontWeight="bold"
      >
        {variacion >= 0 ? '+' : ''}{variacion.toFixed(1)}%
      </text>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* TÍTULO Y DESCRIPCIÓN */}
      <h3 className="chart-title">
        📈 Comparación Anual: {yearA} vs {yearB}
      </h3>
      <p className="chart-description">
        Análisis Year-over-Year (YoY) de {especie}. Compara los volúmenes totales de captura y procesamiento 
        entre {yearA} (gris) y {yearB} (azul). Los porcentajes verdes/rojos indican el crecimiento o decrecimiento 
        respecto al año anterior.
      </p>

      {/* GRÁFICO DE BARRAS AGRUPADAS */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="categoria" 
            tick={{ fill: '#64748b', fontSize: 14, fontWeight: '600' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#cbd5e1' }}
            label={{ 
              value: 'Toneladas', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#64748b', fontSize: 13 }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar 
            dataKey={`${yearA}`} 
            fill={COLORS.YEAR_A} 
            radius={[8, 8, 0, 0]}
            barSize={80}
          />
          <Bar 
            dataKey={`${yearB}`} 
            fill={COLORS.YEAR_B} 
            radius={[8, 8, 0, 0]}
            barSize={80}
            label={renderCustomLabel}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* KPIs DE VARIACIÓN */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        {/* KPI Captura */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
            🎣 Variación en Captura
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: variacionCaptura >= 0 ? COLORS.POSITIVE : COLORS.NEGATIVE 
          }}>
            {variacionCaptura >= 0 ? '+' : ''}{variacionCaptura.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {dataYearA.captura.toLocaleString('es-CL')} ton ({yearA}) → {dataYearB.captura.toLocaleString('es-CL')} ton ({yearB})
          </div>
        </div>

        {/* KPI Procesamiento */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
            🏭 Variación en Procesamiento
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: variacionProcesamiento >= 0 ? COLORS.POSITIVE : COLORS.NEGATIVE 
          }}>
            {variacionProcesamiento >= 0 ? '+' : ''}{variacionProcesamiento.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {dataYearA.procesamiento.toLocaleString('es-CL')} ton ({yearA}) → {dataYearB.procesamiento.toLocaleString('es-CL')} ton ({yearB})
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearComparisonChart;
