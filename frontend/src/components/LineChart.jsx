import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './LineChart.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Componente de gráfico de líneas flexible
 * Soporta modo simple (tendencia mensual) y multi-series (múltiples líneas)
 */
const LineChart = ({ 
  data, 
  title = 'Tendencia Mensual',
  multiSeries = false,
  series = [],
  xKey = 'mes',
  yKey = 'toneladas'
}) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  // Generar etiquetas según el tipo de datos
  const generateLabels = () => {
    if (xKey === 'mes') {
      return data.map(item => meses[parseInt(item.mes) - 1] || `Mes ${item.mes}`);
    } else if (xKey === 'año') {
      return data.map(item => item.año?.toString() || '');
    } else {
      return data.map(item => item[xKey]?.toString() || '');
    }
  };

  // Generar datasets según modo simple o multi-series
  const generateDatasets = () => {
    if (multiSeries && series.length > 0) {
      // Modo multi-series: crear un dataset por cada serie
      return series.map(serie => ({
        label: serie.label,
        data: data.map(item => item[serie.key] || 0),
        borderColor: serie.color,
        backgroundColor: `${serie.color}20`, // Color con transparencia
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: serie.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }));
    } else {
      // Modo simple: una sola línea
      return [
        {
          label: 'Toneladas',
          data: data.map(item => item[yKey] || 0),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ];
    }
  };

  const chartData = {
    labels: generateLabels(),
    datasets: generateDatasets()
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: multiSeries, // Mostrar leyenda solo en modo multi-series
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const value = context.parsed.y.toLocaleString('es-CL');
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}K`;
            }
            return value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="line-chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
