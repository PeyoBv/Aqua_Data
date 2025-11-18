import React from 'react';
import './KPICard.css';

/**
 * Componente de tarjeta KPI
 * Muestra un indicador clave de rendimiento
 */
const KPICard = ({ title, value, unit, icon, color = '#3b82f6' }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toLocaleString('es-CL');
  };

  return (
    <div className="kpi-card" style={{ borderLeftColor: color }}>
      <div className="kpi-header">
        <span className="kpi-icon" style={{ color }}>{icon}</span>
        <h3 className="kpi-title">{title}</h3>
      </div>
      <div className="kpi-content">
        <div className="kpi-value">{formatNumber(value)}</div>
        {unit && <div className="kpi-unit">{unit}</div>}
      </div>
    </div>
  );
};

export default KPICard;
