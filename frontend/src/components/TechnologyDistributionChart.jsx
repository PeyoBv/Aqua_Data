import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ChartDescription.css';

/**
 * Componente de gráfico de dona (Donut Chart) para distribución tecnológica
 * Muestra la distribución de líneas de producción en plantas industriales
 */
const TechnologyDistributionChart = ({ data, title, description, year }) => {
  
  // Colores modernos para las líneas de producción
  const COLORS = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#f59e0b', // Amarillo/Naranja
    '#ef4444', // Rojo
    '#8b5cf6', // Púrpura
    '#ec4899', // Rosa
    '#06b6d4', // Cyan
    '#84cc16', // Lima
    '#f97316', // Naranja
    '#6366f1', // Índigo
    '#14b8a6', // Teal
    '#a855f7', // Violeta
  ];

  // Validar datos
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', padding: '20px' }}>
        <h3 className="chart-title">{title}</h3>
        <p className="chart-description">No hay datos disponibles para el año seleccionado.</p>
      </div>
    );
  }

  // ========================================
  // TOOLTIP PERSONALIZADO
  // ========================================
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const porcentaje = item.payload.porcentaje;

      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '14px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          minWidth: '200px'
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            fontSize: '13px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '6px'
          }}>
            {item.name}
          </p>
          <p style={{ 
            margin: '4px 0', 
            color: '#475569', 
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <span>Líneas:</span>
            <strong>{item.value}</strong>
          </p>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: item.payload.fill, 
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {porcentaje}%
          </p>
        </div>
      );
    }
    return null;
  };

  // ========================================
  // LABEL PERSONALIZADO (Porcentaje dentro del donut)
  // ========================================
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Solo mostrar si el porcentaje es mayor a 5% (evitar texto ilegible)
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="13px"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // ========================================
  // CALCULAR TOTAL PARA PORCENTAJES
  // ========================================
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    porcentaje: ((item.value / total) * 100).toFixed(1)
  }));

  return (
    <div style={{ width: '100%' }}>
      {/* TÍTULO Y DESCRIPCIÓN */}
      <h3 className="chart-title">{title}</h3>
      <p className="chart-description">{description}</p>

      {/* GRÁFICO DE DONA */}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={140}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value, entry) => (
              <span style={{ fontSize: '13px', color: '#475569' }}>
                {value} ({entry.payload.porcentaje}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* ESTADÍSTICAS ADICIONALES */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              📊 Total de Líneas
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
              {total}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              🏭 Tecnologías Distintas
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
              {data.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              ⭐ Tecnología Principal
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', marginTop: '4px' }}>
              {data[0]?.name || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyDistributionChart;
