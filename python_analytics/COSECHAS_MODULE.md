# 🐟 Módulo de Cosechas (Desembarques) - Documentación de Métodos

Documentación completa de los 4 nuevos métodos de análisis para el módulo de Cosechas en Aqua-Data PM.

## 📋 Índice

1. [get_agent_distribution()](#1-get_agent_distribution) - Donut Chart
2. [get_top_ports()](#2-get_top_ports) - Ranking de Puertos
3. [get_species_by_agent_breakdown()](#3-get_species_by_agent_breakdown) - Stacked Bar
4. [get_seasonal_context()](#4-get_seasonal_context) - Comparación Temporal

---

## 1. get_agent_distribution()

### 🎯 Propósito
Alimentar un **Donut Chart** mostrando la distribución porcentual de capturas entre tipos de agente (Industrial, Artesanal, etc.).

### 📊 Caso de Uso Frontend
```jsx
// En tu componente React
const AgentDonutChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchAgentDistribution(2024, "LAGOS")
      .then(result => setData(result.data));
  }, []);
  
  return (
    <PieChart>
      {data.map(item => (
        <Pie 
          key={item.tipo_agente}
          data={item}
          label={`${item.tipo_agente}: ${item.porcentaje}%`}
        />
      ))}
    </PieChart>
  );
};
```

### 🔧 Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `year` | `int` | No | `None` | Año específico a filtrar |
| `region` | `str` | No | `None` | Región específica (ej: "LAGOS", "AYSEN") |

### 📤 Respuesta JSON

```json
{
  "success": true,
  "analysis_type": "agent_distribution",
  "metadata": {
    "year": 2024,
    "region": "LAGOS",
    "generated_at": "2025-11-19T16:30:00"
  },
  "data": [
    {
      "tipo_agente": "Industrial",
      "toneladas": 45678.90,
      "porcentaje": 65.40
    },
    {
      "tipo_agente": "Artesanal",
      "toneladas": 24123.45,
      "porcentaje": 34.60
    }
  ],
  "summary": {
    "total_toneladas": 69802.35,
    "num_tipos_agente": 2,
    "tipo_dominante": "Industrial",
    "porcentaje_dominante": 65.40
  }
}
```

### 💻 Ejemplo Python

```python
from fishery_analytics import load_fishery_data

analytics = load_fishery_data(
    "BD_desembarque.csv",
    "BD_produccion.csv",
    "BD_plantas.csv"
)

# Sin filtros
result = analytics.get_agent_distribution()

# Con año específico
result = analytics.get_agent_distribution(year=2024)

# Con región específica
result = analytics.get_agent_distribution(region="LAGOS")

# Ambos filtros
result = analytics.get_agent_distribution(year=2024, region="AYSEN")
```

### ⚠️ Manejo de Errores

```json
{
  "success": false,
  "error": "No hay datos disponibles para los filtros especificados",
  "data": [],
  "summary": {}
}
```

---

## 2. get_top_ports()

### 🎯 Propósito
Alimentar un **Bar Chart horizontal** con el ranking de puertos por volumen de desembarque.

### 📊 Caso de Uso Frontend
```jsx
// En tu componente React
const TopPortsChart = () => {
  const [ports, setPorts] = useState([]);
  
  useEffect(() => {
    fetchTopPorts(2024, null, 10)
      .then(result => setPorts(result.data));
  }, []);
  
  return (
    <BarChart data={ports} layout="horizontal">
      <XAxis type="number" />
      <YAxis type="category" dataKey="puerto" />
      <Bar dataKey="toneladas" fill="#8884d8" />
    </BarChart>
  );
};
```

### 🔧 Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `year` | `int` | No | `None` | Año específico a filtrar |
| `region` | `str` | No | `None` | Región específica |
| `top_n` | `int` | No | `10` | Número de puertos top a retornar |

### 📤 Respuesta JSON

```json
{
  "success": true,
  "analysis_type": "top_ports",
  "metadata": {
    "year": 2024,
    "region": null,
    "top_n": 10,
    "generated_at": "2025-11-19T16:30:00"
  },
  "data": [
    {
      "puerto": "PUERTO MONTT",
      "toneladas": 125678.45,
      "ranking": 1
    },
    {
      "puerto": "CALBUCO",
      "toneladas": 98234.12,
      "ranking": 2
    },
    {
      "puerto": "ANCUD",
      "toneladas": 76543.21,
      "ranking": 3
    }
  ],
  "summary": {
    "total_toneladas_top_n": 450234.56,
    "total_toneladas_general": 689012.34,
    "porcentaje_concentracion": 65.34,
    "num_puertos_total": 45,
    "puerto_lider": "PUERTO MONTT"
  }
}
```

### 💻 Ejemplo Python

```python
# Top 10 puertos (default)
result = analytics.get_top_ports()

# Top 5 puertos en 2024
result = analytics.get_top_ports(year=2024, top_n=5)

# Top 15 puertos en región Lagos
result = analytics.get_top_ports(region="LAGOS", top_n=15)
```

### 📊 Interpretación del Summary

- **porcentaje_concentracion**: Qué % del total representa el Top N
- **num_puertos_total**: Total de puertos únicos en el dataset filtrado
- **puerto_lider**: Puerto #1 del ranking

---

## 3. get_species_by_agent_breakdown()

### 🎯 Propósito
Alimentar un **Stacked Bar Chart** mostrando cuánto captura cada tipo de agente por especie.

### 📊 Caso de Uso Frontend
```jsx
// En tu componente React
const SpeciesStackedBar = () => {
  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  
  useEffect(() => {
    fetchSpeciesByAgent(2024)
      .then(result => {
        setData(result.data);
        setAgents(result.summary.tipos_agente);
      });
  }, []);
  
  return (
    <BarChart data={data}>
      <XAxis dataKey="especie" />
      <YAxis />
      <Tooltip />
      <Legend />
      {agents.map(agent => (
        <Bar 
          key={agent}
          dataKey={agent} 
          stackId="a" 
          fill={getColor(agent)}
        />
      ))}
    </BarChart>
  );
};
```

### 🔧 Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `year` | `int` | No | `None` | Año específico a filtrar |
| `region` | `str` | No | `None` | Región específica |
| `top_n` | `int` | No | `10` | Número de especies top a analizar |

### 📤 Respuesta JSON

```json
{
  "success": true,
  "analysis_type": "species_by_agent_breakdown",
  "metadata": {
    "year": 2024,
    "region": null,
    "top_n": 10,
    "generated_at": "2025-11-19T16:30:00"
  },
  "data": [
    {
      "especie": "SALMON DEL ATLANTICO",
      "Industrial": 45678.90,
      "Artesanal": 1234.56,
      "total": 46913.46
    },
    {
      "especie": "JUREL",
      "Industrial": 89012.34,
      "Artesanal": 12345.67,
      "total": 101358.01
    },
    {
      "especie": "MERLUZA COMUN",
      "Industrial": 67890.12,
      "Artesanal": 8901.23,
      "total": 76791.35
    }
  ],
  "summary": {
    "num_especies": 10,
    "tipos_agente": ["Industrial", "Artesanal"],
    "total_toneladas": 524123.45,
    "especie_lider": "JUREL",
    "participacion_por_tipo": {
      "Industrial": 478901.23,
      "Artesanal": 45222.22
    }
  }
}
```

### 💻 Ejemplo Python

```python
# Top 10 especies (default)
result = analytics.get_species_by_agent_breakdown()

# Top 5 especies en 2023
result = analytics.get_species_by_agent_breakdown(year=2023, top_n=5)

# Top 15 especies en región Aysén
result = analytics.get_species_by_agent_breakdown(region="AYSEN", top_n=15)
```

### 🎨 Recomendaciones de Visualización

```javascript
// Colores sugeridos para tipos de agente
const agentColors = {
  'Industrial': '#2563eb',  // Azul
  'Artesanal': '#16a34a',   // Verde
  'Otro': '#d97706'         // Naranja
};

// Renderizar barras apiladas
data.map(species => (
  <Bar 
    dataKey="especie"
    name={species.especie}
    fill={agentColors[species.tipo_agente]}
    stackId="stack"
  />
))
```

---

## 4. get_seasonal_context()

### 🎯 Propósito
Alimentar una **Línea de Tiempo Comparativa** mostrando el año actual vs promedio histórico mes a mes.

### 📊 Caso de Uso Frontend
```jsx
// En tu componente React
const SeasonalComparison = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchSeasonalContext(2024, "LAGOS")
      .then(result => setData(result.data));
  }, []);
  
  return (
    <LineChart data={data}>
      <XAxis dataKey="mes_nombre" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="actual" 
        stroke="#ef4444" 
        name="2024"
        strokeWidth={3}
      />
      <Line 
        type="monotone" 
        dataKey="historico" 
        stroke="#94a3b8" 
        name="Promedio Histórico"
        strokeDasharray="5 5"
      />
    </LineChart>
  );
};
```

### 🔧 Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `current_year` | `int` | No | `2023` | Año actual a comparar |
| `region` | `str` | No | `None` | Región específica |

### 📤 Respuesta JSON

```json
{
  "success": true,
  "analysis_type": "seasonal_context",
  "metadata": {
    "current_year": 2024,
    "region": "LAGOS",
    "generated_at": "2025-11-19T16:30:00"
  },
  "data": [
    {
      "mes": 1,
      "mes_nombre": "Enero",
      "actual": 5678.90,
      "historico": 5234.12,
      "diferencia": 444.78,
      "variacion_porcentual": 8.50
    },
    {
      "mes": 2,
      "mes_nombre": "Febrero",
      "actual": 6789.01,
      "historico": 6123.45,
      "diferencia": 665.56,
      "variacion_porcentual": 10.87
    }
    // ... 12 meses total
  ],
  "summary": {
    "año_actual": 2024,
    "años_historicos_incluidos": 24,
    "total_actual": 89012.34,
    "total_historico": 85678.90,
    "diferencia_total": 3333.44,
    "variacion_anual": 3.89,
    "mes_mayor_actual": "Julio",
    "mes_mayor_historico": "Agosto"
  }
}
```

### 💻 Ejemplo Python

```python
# Comparar 2024 vs histórico (todas las regiones)
result = analytics.get_seasonal_context(current_year=2024)

# Comparar 2023 vs histórico en Lagos
result = analytics.get_seasonal_context(current_year=2023, region="LAGOS")

# Comparar 2022 vs histórico en Aysén
result = analytics.get_seasonal_context(current_year=2022, region="AYSEN")
```

### 📊 Interpretación del Summary

- **años_historicos_incluidos**: Cuántos años se usaron para el promedio (ej: 2000-2023 = 24 años)
- **variacion_anual**: % de cambio del año actual vs histórico
  - Positivo: Año actual superior
  - Negativo: Año actual inferior
- **mes_mayor_actual**: Mes pico del año analizado
- **mes_mayor_historico**: Mes pico promedio histórico

### 🎨 Visualización Recomendada

```jsx
// Configuración sugerida para LineChart
<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="mes_nombre" />
  <YAxis 
    label={{ value: 'Toneladas', angle: -90, position: 'insideLeft' }}
  />
  <Tooltip 
    formatter={(value) => value.toLocaleString('es-CL') + ' ton'}
  />
  <Legend />
  
  {/* Año Actual - Línea sólida roja */}
  <Line 
    type="monotone" 
    dataKey="actual" 
    stroke="#ef4444" 
    strokeWidth={3}
    name={`Año ${currentYear}`}
    dot={{ r: 5 }}
  />
  
  {/* Promedio Histórico - Línea punteada gris */}
  <Line 
    type="monotone" 
    dataKey="historico" 
    stroke="#94a3b8" 
    strokeWidth={2}
    strokeDasharray="5 5"
    name="Promedio Histórico"
    dot={{ r: 3 }}
  />
  
  {/* Área de diferencia (opcional) */}
  <Area 
    type="monotone" 
    dataKey="diferencia" 
    fill="#fbbf24" 
    fillOpacity={0.2}
    name="Diferencia"
  />
</LineChart>
```

---

## 🚀 Uso Completo en Express API

### Endpoint Example

```javascript
// En tu Express router
const express = require('express');
const { PythonShell } = require('python-shell');
const router = express.Router();

// GET /api/v1/cosechas/agent-distribution
router.get('/cosechas/agent-distribution', async (req, res) => {
  const { year, region } = req.query;
  
  try {
    // Llamar al script Python
    const options = {
      mode: 'json',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: './python_analytics',
      args: ['get_agent_distribution', year, region]
    };
    
    PythonShell.run('fishery_api.py', options, (err, results) => {
      if (err) throw err;
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/cosechas/top-ports
router.get('/cosechas/top-ports', async (req, res) => {
  const { year, region, top_n = 10 } = req.query;
  
  // Similar implementation...
});

// GET /api/v1/cosechas/species-breakdown
router.get('/cosechas/species-breakdown', async (req, res) => {
  const { year, region, top_n = 10 } = req.query;
  
  // Similar implementation...
});

// GET /api/v1/cosechas/seasonal-context
router.get('/cosechas/seasonal-context', async (req, res) => {
  const { current_year = 2023, region } = req.query;
  
  // Similar implementation...
});

module.exports = router;
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Navegar al directorio python_analytics
cd python_analytics

# Ejecutar script de pruebas
python test_cosechas_module.py

# O con Python 3
python3 test_cosechas_module.py
```

### Output Esperado

```
================================================================================
PRUEBA DE MÉTODOS DEL MÓDULO DE COSECHAS
================================================================================

📦 Cargando datos desde CSV...
✅ Datos cargados correctamente

================================================================================
1️⃣  DISTRIBUCIÓN POR TIPO DE AGENTE (Donut Chart)
================================================================================

📊 Sin filtros (todos los años, todas las regiones):
   Total de toneladas: 1,234,567.89
   Número de tipos de agente: 2
   Tipo dominante: Industrial (65.40%)
...
```

---

## 📦 Dependencias

```bash
pip install pandas numpy
```

O usando el archivo `requirements.txt`:

```bash
cd python_analytics
pip install -r requirements.txt
```

---

## 🔧 Troubleshooting

### Error: "Columna X no disponible"

```json
{
  "success": false,
  "error": "Columna 'Puerto' no disponible en df_desembarque"
}
```

**Solución**: Verificar que el CSV tenga las columnas requeridas:
- Año, Mes, Región, Puerto, Especie, Tipo de agente, Toneladas

### Error: "No hay datos disponibles para los filtros"

```json
{
  "success": false,
  "error": "No hay datos disponibles para los filtros especificados",
  "data": [],
  "summary": {}
}
```

**Solución**: 
- Verificar que el año existe en el dataset
- Verificar que el nombre de región esté en mayúsculas (ej: "LAGOS", no "lagos")
- Verificar que haya registros para esa combinación de filtros

---

## 📊 Resumen de Métodos

| Método | Gráfico | Filtros | Top N | Uso Principal |
|--------|---------|---------|-------|---------------|
| `get_agent_distribution()` | Donut | ✅ | ❌ | Ver participación Industrial vs Artesanal |
| `get_top_ports()` | Bar Horizontal | ✅ | ✅ | Ranking de puertos por volumen |
| `get_species_by_agent_breakdown()` | Stacked Bar | ✅ | ✅ | Comparar captura por especie y agente |
| `get_seasonal_context()` | Line Chart | ✅ | ❌ | Comparar año actual vs histórico |

---

## 📝 Notas Técnicas

### Manejo de Valores Nulos

Todos los métodos:
- Usan `dropna()` para eliminar filas con valores nulos en columnas clave
- Usan `fillna(0)` para rellenar valores numéricos faltantes
- Retornan `success: false` si no hay datos después del filtrado

### Normalización de Datos

- Regiones se convierten a mayúsculas automáticamente
- Especies se normalizan a mayúsculas
- Espacios en blanco se eliminan con `strip()`

### Serialización JSON

- Valores `NaN` se convierten a `None` (null en JSON)
- Valores `Inf` se convierten a `None`
- Todos los números se redondean a 2 decimales

---

## 🎯 Roadmap Futuro

Posibles mejoras:

- [ ] Agregar caché de resultados
- [ ] Soporte para múltiples regiones simultáneas
- [ ] Export a Excel/CSV
- [ ] Gráficos estáticos con matplotlib
- [ ] API REST nativa en Python (FastAPI)

---

**Autor**: Barri - Aqua-Data PM  
**Fecha**: 19 de Noviembre de 2025  
**Versión**: 1.0.0
