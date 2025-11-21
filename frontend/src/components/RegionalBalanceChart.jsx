import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ChartDescription.css';

/**
 * Componente de gráfico de barras horizontales para balance regional
 * Muestra Captura vs Procesamiento por región con layout vertical
 * Colores armonizados con AreaLineChart principal
 * SOLO MUESTRA TOP 4 REGIONES + OTRAS
 */
const RegionalBalanceChart = ({ data, title, description, especie }) => {
  
  // Colores armonizados con el gráfico principal de Trazabilidad (AreaLineChart)
  const COLORS = {
    CAPTURA: '#3b82f6',      // Azul - mismo que Desembarque
    PROCESAMIENTO: '#10b981'  // Verde - mismo que Materia Prima
  };

  // ========================================
  // PROCESAMIENTO DE DATOS: TOP 4 + OTRAS
  // ========================================
  
  // 1. Validar que existan datos
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <h3 className="chart-title">{title}</h3>
        <p className="chart-description">No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  // 2. Ordenar regiones específicas por CAPTURA descendente
  const sortedData = [...data].sort((a, b) => b.captura - a.captura);

  // 3. Tomar TOP 4 regiones
  const topRegions = sortedData.slice(0, 4);

  // 4. Calcular el RESTO (regiones 5 en adelante)
  const otherRegions = sortedData.slice(4);
  
  // 5. Inicializar array final con TOP 4 ordenadas
  let finalData = [...topRegions];

  // 6. REGLA "Hide Empty": Solo agregar "OTRAS" si tiene datos reales
  if (otherRegions.length > 0) {
    const otherCaptura = otherRegions.reduce((sum, item) => sum + (item.captura || 0), 0);
    const otherProcesamiento = otherRegions.reduce((sum, item) => sum + (item.procesamiento || 0), 0);

    // ✅ Solo agregar si hay captura O procesamiento (> 0)
    // ✅ REGLA "Pin to Bottom": Usar push() para forzar posición al final
    if (otherCaptura > 0 || otherProcesamiento > 0) {
      finalData.push({
        region: 'OTRAS',
        captura: Math.round(otherCaptura),
        procesamiento: Math.round(otherProcesamiento)
      });
    }
  }

  // 7. DEPURACIÓN: Verificar estructura final
  console.log('🔍 [RegionalBalanceChart] Datos originales:', data.length, 'regiones');
  console.log('📊 [RegionalBalanceChart] TOP 4 ordenadas:', topRegions.map(r => r.region));
  console.log('📌 [RegionalBalanceChart] OTRAS agregada:', finalData.length > 4 ? 'SÍ' : 'NO');
  console.log('✅ [RegionalBalanceChart] Total barras a graficar:', finalData.length);

  // ========================================
  // TOOLTIP PERSONALIZADO
  // ========================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const captura = payload.find(p => p.dataKey === 'captura')?.value || 0;
      const procesamiento = payload.find(p => p.dataKey === 'procesamiento')?.value || 0;
      const porcentaje = captura > 0 ? ((procesamiento / captura) * 100).toFixed(1) : 0;
      const brecha = captura - procesamiento;

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
            color: COLORS.CAPTURA, 
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <span>🎣 Captura:</span>
            <strong>{captura.toLocaleString('es-CL')} ton</strong>
          </p>
          <p style={{ 
            margin: '5px 0', 
            color: COLORS.PROCESAMIENTO, 
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <span>🏭 Procesamiento:</span>
            <strong>{procesamiento.toLocaleString('es-CL')} ton</strong>
          </p>
          <div style={{ 
            margin: '10px 0 0 0', 
            paddingTop: '8px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{ 
              margin: '4px 0', 
              color: '#64748b', 
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>✅ Procesado:</span>
              <strong>{porcentaje}%</strong>
            </p>
            <p style={{ 
              margin: '4px 0', 
              color: '#94a3b8', 
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>📊 Brecha:</span>
              <strong>{brecha.toLocaleString('es-CL')} ton</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // ========================================
  // RENDERIZADO - USA finalData (NO data)
  // ========================================
  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <h3 className="chart-title">{title}</h3>
      {description && <p className="chart-description">{description}</p>}
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={finalData}
          layout="vertical"
          margin={{ top: 30, right: 60, left: 20, bottom: 30 }}
          barSize={45}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          {/* Eje Y = Nombres de Regiones (con espacio optimizado) */}
          <YAxis 
            type="category"
            dataKey="region" 
            stroke="#64748b"
            style={{ fontSize: '14px', fontWeight: 500 }}
            width={120}
            tick={{ fill: '#1e293b' }}
          />
          
          {/* Eje X = Toneladas */}
          <XAxis 
            type="number"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
            label={{ 
              value: 'Toneladas', 
              position: 'insideBottom',
              offset: -10,
              style: { fontSize: '12px', fill: '#64748b' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '15px' }}
            iconType="rect"
          />
          
          {/* Barra de Captura (Azul - mismo color que AreaLineChart) */}
          <Bar 
            dataKey="captura" 
            name="Captura Total"
            fill={COLORS.CAPTURA}
            radius={[0, 8, 8, 0]}
          />
          
          {/* Barra de Procesamiento (Verde - mismo color que AreaLineChart) */}
          <Bar 
            dataKey="procesamiento" 
            name="Procesamiento Industrial"
            fill={COLORS.PROCESAMIENTO}
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegionalBalanceChart;
