# API Endpoint: Cosechas

## GET `/api/v1/cosechas`

Endpoint para obtener KPIs y datos de gráficos sobre cosechas (desembarques).

### Query Parameters (Filtros)

Todos los parámetros son opcionales:

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `anio` | number | Filtrar por año | `2020` |
| `region` | string | Filtrar por región | `Tarapacá` |
| `especie` | string | Filtrar por especie | `Anchoveta` |

### Respuesta

```json
{
  "success": true,
  "filters": {
    "anio": 2020,
    "region": "TARAPACÁ"
  },
  "kpis": {
    "cosechaTotal": 123456.78,
    "mesesConDatos": 12,
    "especiesDetectadas": 25
  },
  "grafico_mensual": [
    { "mes": "1", "toneladas": 10000 },
    { "mes": "2", "toneladas": 12000 },
    ...
  ],
  "grafico_especies": [
    { "especie": "ANCHOVETA", "toneladas": 50000 },
    { "especie": "JUREL", "toneladas": 30000 },
    ...
  ]
}
```

### Ejemplos de Uso

#### 1. Obtener todos los datos sin filtros
```
GET http://localhost:3000/api/v1/cosechas
```

#### 2. Filtrar por año
```
GET http://localhost:3000/api/v1/cosechas?anio=2020
```

#### 3. Filtrar por región
```
GET http://localhost:3000/api/v1/cosechas?region=Tarapacá
```

#### 4. Filtrar por año y región
```
GET http://localhost:3000/api/v1/cosechas?anio=2020&region=Tarapacá
```

#### 5. Filtrar por año, región y especie
```
GET http://localhost:3000/api/v1/cosechas?anio=2020&region=Tarapacá&especie=Anchoveta
```

### KPIs Retornados

- **cosechaTotal**: Total de toneladas desembarcadas según los filtros
- **mesesConDatos**: Cantidad de meses únicos con datos
- **especiesDetectadas**: Cantidad de especies únicas encontradas

### Gráficos

#### grafico_mensual
Array ordenado por mes, con el total de toneladas por mes.

#### grafico_especies
Array ordenado por toneladas (descendente), con el total por especie.

### Normalización de Filtros

Los filtros se normalizan automáticamente:
- Los textos se convierten a MAYÚSCULAS y se les aplica trim
- Los números se validan y convierten correctamente
- La comparación es case-insensitive

### Manejo de Errores

Si no hay datos disponibles o no se encuentran resultados:

```json
{
  "success": true,
  "message": "No se encontraron datos con los filtros aplicados",
  "filters": { ... },
  "kpis": {
    "cosechaTotal": 0,
    "mesesConDatos": 0,
    "especiesDetectadas": 0
  },
  "grafico_mensual": [],
  "grafico_especies": []
}
```

Si hay un error interno:

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Descripción del error",
  "kpis": {
    "cosechaTotal": 0,
    "mesesConDatos": 0,
    "especiesDetectadas": 0
  },
  "grafico_mensual": [],
  "grafico_especies": []
}
```

### Notas Técnicas

- Los datos provienen del array `desembarques` cargado en memoria
- Los valores decimales se redondean a 2 decimales
- Las especies se ordenan por toneladas (mayor a menor)
- Los meses se ordenan numéricamente cuando es posible
- El endpoint es tolerante a errores y siempre devuelve una estructura válida
