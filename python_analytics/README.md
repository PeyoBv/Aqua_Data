# 🐟 FisheryAnalytics - Python Analytics Module

Módulo de análisis avanzado para datos pesqueros chilenos construido con Pandas y Python.

## 📋 Descripción

`FisheryAnalytics` es una clase Python que proporciona métodos de análisis comparativo y temporal para la industria pesquera chilena. Procesa 3 datasets principales:

1. **Desembarques** (2000-2024): Datos de capturas
2. **Producción** (2010-2024): Procesamiento industrial
3. **Plantas** (2010-2024): Infraestructura de procesamiento

## 🚀 Instalación

```bash
# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## 📊 Métodos de Análisis

### 1. `get_supply_vs_demand()`
Comparación entre capturas (oferta) y materia prima procesada (demanda industrial).

**Parámetros:**
- `start_year`: Año inicial (default: 2010)
- `end_year`: Año final (default: último disponible)
- `region`: Filtro opcional por región

**Retorna:**
```json
{
  "success": true,
  "data": [
    {
      "Año": 2020,
      "Especie": "SALMON",
      "Capturas": 10000.0,
      "Materia_Prima": 8000.0,
      "Delta": 2000.0,
      "Porcentaje_Utilizado": 80.0
    }
  ],
  "summary": {
    "total_capturas": 50000.0,
    "total_materia_prima": 40000.0,
    "especies_analizadas": 15
  }
}
```

### 2. `get_conversion_efficiency()`
Eficiencia de conversión de materia prima a producto final (yield).

**Parámetros:**
- `top_n`: Número de resultados (default: 20)
- `min_materia_prima`: Filtro mínimo (default: 100.0)

**Métricas:**
- Yield = (Producción / Materia Prima) × 100

### 3. `get_regional_dynamics()`
Comparación entre actividad extractiva y productiva por región.

**Métricas:**
- Capturas totales por región
- Producción total por región
- Ratio Producción/Captura

### 4. `get_longitudinal_evolution()`
Evolución temporal de capturas y número de plantas (2000-2024).

**Incluye:**
- Serie temporal de capturas
- Serie temporal de plantas activas
- Tasas de crecimiento año a año

### 5. `get_agent_share()`
Participación por tipo de agente (Artesanal vs Industrial) por región.

**Formato:**
- Tabla pivote con toneladas por agente
- Porcentajes de participación

### 6. `get_plant_capacity_analysis()`
Análisis de capacidad: productividad por planta.

**Métricas:**
- Número de plantas por región/año
- Producción total
- Promedio de producción por planta

## 💻 Ejemplo de Uso

### Uso Básico

```python
import pandas as pd
from fishery_analytics import FisheryAnalytics

# Cargar datos
df_desembarque = pd.read_csv('data/DESEMBARQUES_2000_2024.csv')
df_produccion = pd.read_csv('data/PRODUCCION_MATERIA_PRIMA_2010_2024.csv')
df_plantas = pd.read_csv('data/PLANTAS_INDUSTRIALES_2010_2024.csv')

# Crear instancia
analytics = FisheryAnalytics(df_desembarque, df_produccion, df_plantas)

# Ejecutar análisis
result = analytics.get_supply_vs_demand(start_year=2015, region='LAGOS')
print(result['summary'])

# Eficiencia de conversión
efficiency = analytics.get_conversion_efficiency(top_n=10)
for record in efficiency['data']:
    print(f"{record['Especie']}: {record['Yield']}%")

# Exportar todos los análisis
all_results = analytics.export_all_analyses(output_format='json')
```

### Uso con Helper Function

```python
from fishery_analytics import load_fishery_data

# Cargar automáticamente desde CSV
analytics = load_fishery_data(
    'data/DESEMBARQUES_2000_2024.csv',
    'data/PRODUCCION_MATERIA_PRIMA_2010_2024.csv',
    'data/PLANTAS_INDUSTRIALES_2010_2024.csv'
)

# Listo para usar
result = analytics.get_regional_dynamics()
```

## 🌐 Integración con API REST

### Ejemplo con FastAPI

```python
from fastapi import FastAPI, Query
from fishery_analytics import load_fishery_data

app = FastAPI(title="Fishery Analytics API")

# Cargar datos al iniciar
analytics = load_fishery_data(
    'data/DESEMBARQUES_2000_2024.csv',
    'data/PRODUCCION_MATERIA_PRIMA_2010_2024.csv',
    'data/PLANTAS_INDUSTRIALES_2010_2024.csv'
)

@app.get("/api/analysis/supply-demand")
async def supply_demand(
    start_year: int = Query(2010, ge=2000, le=2024),
    region: str = None
):
    return analytics.get_supply_vs_demand(start_year, region=region)

@app.get("/api/analysis/efficiency")
async def efficiency(top_n: int = Query(20, ge=1, le=100)):
    return analytics.get_conversion_efficiency(top_n=top_n)

@app.get("/api/analysis/all")
async def all_analyses():
    return analytics.export_all_analyses(output_format='dict')
```

**Ejecutar:**
```bash
uvicorn api:app --reload
```

**Endpoints disponibles:**
- `GET /api/analysis/supply-demand?start_year=2015&region=LAGOS`
- `GET /api/analysis/efficiency?top_n=10`
- `GET /api/analysis/regional`
- `GET /api/analysis/evolution`
- `GET /api/analysis/agents`
- `GET /api/analysis/capacity`
- `GET /api/analysis/all`

## 🧪 Tests

```bash
# Ejecutar tests unitarios
python test_analytics.py

# O con pytest
pytest test_analytics.py -v

# Con cobertura
pytest test_analytics.py --cov=fishery_analytics --cov-report=html
```

## 📁 Estructura de Archivos

```
python_analytics/
├── fishery_analytics.py      # Clase principal
├── example_usage.py           # Ejemplos de uso
├── test_analytics.py          # Tests unitarios
├── requirements.txt           # Dependencias
└── README.md                  # Esta documentación
```

## 📊 Formato de Datos Esperado

### Desembarques (CSV)
```
Año,Mes,Región,Puerto,Especie,Tipo de agente,Toneladas
2020,1,LAGOS,Puerto Montt,SALMON,Industrial,1000
```

### Producción (CSV)
```
Año,Región,Especie,Línea de elaboración,Materia Prima,Producción
2020,LAGOS,SALMON,Congelado,800,700
```

### Plantas (CSV)
```
Año,Región,Nombre Planta,Línea de producción
2020,LAGOS,Planta A,Congelado
```

## 🔧 Características Técnicas

- ✅ **Normalización automática**: Regiones, especies y columnas
- ✅ **Validación de datos**: Verifica estructura al inicializar
- ✅ **JSON-serializable**: Todos los outputs listos para API
- ✅ **Manejo de NaN**: Reemplazo inteligente de valores faltantes
- ✅ **Filtros flexibles**: Por año, región, especie, etc.
- ✅ **Docstrings completos**: Documentación en código
- ✅ **Type hints**: Anotaciones de tipos Python
- ✅ **Tests unitarios**: Cobertura completa

## 📈 Casos de Uso

1. **Planificación Industrial**: Analizar oferta vs demanda para planificar capacidad
2. **Optimización de Procesos**: Identificar líneas de elaboración más eficientes
3. **Análisis Regional**: Comparar productividad entre regiones
4. **Tendencias Temporales**: Identificar patrones estacionales y tendencias
5. **Reportes Ejecutivos**: Generar resúmenes automáticos para stakeholders
6. **APIs de Datos**: Integrar con dashboards y aplicaciones web

## 🤝 Integración con Node.js Backend

Este módulo Python puede integrarse con el backend Node.js existente:

```javascript
// Node.js - ejecutar script Python
const { spawn } = require('child_process');

function runPythonAnalysis(analysisType, params) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'python_analytics/api_wrapper.py',
      analysisType,
      JSON.stringify(params)
    ]);
    
    let result = '';
    python.stdout.on('data', (data) => { result += data; });
    python.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(result));
      else reject(new Error('Python execution failed'));
    });
  });
}
```

## 📝 Notas

- **Rendimiento**: Optimizado para datasets de hasta 1M registros
- **Memoria**: Usa copias de DataFrames para evitar modificaciones
- **Thread-safety**: No diseñado para concurrencia (usar instancias separadas)
- **Encoding**: UTF-8 por defecto para caracteres especiales

## 🐛 Troubleshooting

**Error: "Columna X faltante"**
- Verifica que los CSV tengan las columnas requeridas
- Revisa la normalización de nombres (espacios, mayúsculas)

**Error: "No module named 'pandas'"**
- Ejecuta: `pip install -r requirements.txt`

**Performance lento**
- Filtra datos antes de análisis pesados
- Usa `min_materia_prima` en `get_conversion_efficiency()`
- Considera cachear resultados

## 📄 Licencia

Parte del proyecto Aqua-Data PM - Análisis Pesquero Macro-Zona Sur de Chile

---

**Autor**: Barri - Senior Data Engineer  
**Fecha**: 19 de Noviembre 2025  
**Versión**: 1.0.0
