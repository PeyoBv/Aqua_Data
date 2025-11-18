# 🌊 Aqua-Data

**Sistema de análisis y visualización de datos pesqueros de Chile**

Aplicación full-stack para procesar, analizar y visualizar datos de desembarques, materia prima y producción de la industria pesquera chilena. El sistema carga automáticamente más de 860,000 registros CSV en memoria para consultas rápidas y eficientes.

![Node.js](https://img.shields.io/badge/Node.js-20.16.0-green)
![Express](https://img.shields.io/badge/Express-4.18.2-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646cff)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#️-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Ejecución](#-ejecución)
- [API Reference](#-api-reference)
- [Frontend Dashboard](#-frontend-dashboard)
- [Módulo de Normalización](#-módulo-de-normalización)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Tecnologías](#️-tecnologías)

---

## ✨ Características

### Backend
- ✅ **Servidor Express.js** con arquitectura modular MVC
- ✅ **Carga automática de CSV** al iniciar (220K+ desembarques, 640K+ registros adicionales)
- ✅ **Procesamiento robusto** con encoding Latin1 y delimitador personalizado
- ✅ **Módulo de normalización** centralizado para limpieza y validación de datos
- ✅ **API RESTful** con filtros dinámicos por año, región y especie
- ✅ **Almacenamiento en memoria** para consultas de alta velocidad
- ✅ **CORS configurado** para comunicación segura con frontend

### Frontend
- ✅ **Dashboard interactivo** con React + Vite
- ✅ **Visualizaciones dinámicas** con Chart.js (líneas, barras)
- ✅ **KPI Cards** con métricas en tiempo real
- ✅ **Filtros responsivos** con actualizaciones automáticas
- ✅ **Proxy configurado** para desarrollo sin CORS issues
- ✅ **Componentes modulares** y reutilizables

### Datos
- ✅ **220,214 registros** de desembarques
- ✅ **321,993 registros** de materia prima/producción
- ✅ **321,993 registros** de plantas procesadoras
- ✅ **Rango temporal**: Datos desde el año 2000 en adelante
- ✅ **Cobertura geográfica**: Todas las regiones de Chile
- ✅ **Especies**: Más de 275 especies marinas

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA AQUA-DATA                      │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐           ┌──────────────────────┐           ┌─────────────────────┐
│   FRONTEND          │           │   BACKEND            │           │   DATOS             │
│   React + Vite      │  HTTP     │   Express.js         │  FS Read  │   CSV Files         │
│   localhost:5173    │◄─────────►│   localhost:3000     │◄─────────►│   Base de Datos/    │
└─────────────────────┘  REST API └──────────────────────┘           └─────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐           ┌──────────────────────┐
│  Componentes UI     │           │  Capas Backend       │
├─────────────────────┤           ├──────────────────────┤
│ • KPICard           │           │ • Routes (v1)        │
│ • LineChart         │           │ • Controllers        │
│ • BarChart          │           │ • Services           │
│ • Filters           │           │   - dataLoader       │
│ • App (Container)   │           │   - cosechas         │
└─────────────────────┘           │ • Data Store (RAM)   │
         │                        │ • Utils              │
         │                        │   - normalizar.js    │
         ▼                        └──────────────────────┘
┌─────────────────────┐                    │
│  Services           │                    │
├─────────────────────┤                    ▼
│ • api.js (Axios)    │           ┌──────────────────────┐
│ • cosechasAPI       │           │  Almacenamiento      │
└─────────────────────┘           ├──────────────────────┤
                                  │ • 220K desembarques  │
                                  │ • 322K mat. prima    │
                                  │ • 322K plantas       │
                                  │ Total: ~864K records │
                                  └──────────────────────┘
```

### Flujo de Datos

1. **Inicio**: Backend carga 3 CSV → Normaliza → Almacena en RAM
2. **Request**: Frontend solicita datos con filtros → `GET /api/v1/cosechas?anio=2013`
3. **Process**: Backend filtra datos → Calcula KPIs → Genera gráficos
4. **Response**: JSON con KPIs + datos para visualizaciones
5. **Render**: Frontend actualiza componentes con Chart.js

---

## 📦 Requisitos Previos

- **Node.js**: v20.16.0 o superior ([Descargar](https://nodejs.org/))
- **npm**: v10.x o superior (incluido con Node.js)
- **Git**: Para clonar el repositorio
- **Editor de código**: VS Code recomendado
- **Navegador**: Chrome, Firefox o Edge (versiones recientes)

**Verificar instalación:**
```bash
node --version   # Debe mostrar v20.16.0 o superior
npm --version    # Debe mostrar v10.x o superior
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/Aqua-Data.git
cd Aqua-Data
```

### 2. Instalar Dependencias del Backend

```bash
npm install
```

**Paquetes instalados:**
- `express@4.18.2` - Framework web
- `csv-parser@3.0.0` - Parser de CSV
- `cors@2.8.5` - Middleware CORS
- `dotenv@16.3.1` - Variables de entorno

**DevDependencies:**
- `nodemon@3.0.1` - Auto-reload en desarrollo

### 3. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
cd ..
```

**Paquetes instalados:**
- `react@18.3.1` - Librería UI
- `react-dom@18.3.1` - React DOM
- `vite@5.4.21` - Build tool
- `axios@1.6.2` - Cliente HTTP
- `chart.js@4.4.1` - Gráficos
- `react-chartjs-2@5.2.0` - React wrapper para Chart.js

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor backend
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# Ruta base a los archivos CSV
# Usar rutas relativas desde la raíz del proyecto
CSV_BASE_PATH=./Base de Datos
```

**Notas importantes:**
- `CSV_BASE_PATH` debe apuntar a la carpeta que contiene `BD_desembarque/`, `BD_materia_prima_produccion/`, y `BD_plantas/`
- En Windows, usar barras normales `/` o dobles barras invertidas `\\`
- NO incluir barra final en la ruta

### Estructura de Archivos CSV Requerida

```
Base de Datos/
├── BD_desembarque/
│   └── BD_desembarque.csv
├── BD_materia_prima_produccion/
│   └── BD_materia_prima_produccion.csv
└── BD_plantas/
    └── BD_plantas.csv
```

**Formato de CSV:**
- **Encoding**: Latin1 (ISO-8859-1)
- **Delimitador**: Punto y coma (`;`)
- **Primera fila**: Nombres de columnas
- **Decimales**: Soporta coma `,` o punto `.`

---

## 🎮 Ejecución

### Opción 1: Modo Desarrollo (Recomendado)

#### Terminal 1 - Backend con auto-reload
```bash
npm run dev
```

Esto ejecuta `nodemon server.js` que reiniciará automáticamente el servidor al detectar cambios.

**Salida esperada:**
```
🚀 Iniciando carga de datos CSV...

📂 Cargando archivo: BD_desembarque.csv...
📂 Cargando archivo: BD_materia_prima_produccion.csv...
📂 Cargando archivo: BD_plantas.csv...
✅ BD_desembarque.csv cargado: 220214 registros
✅ BD_materia_prima_produccion.csv cargado: 321993 registros
✅ BD_plantas.csv cargado: 321993 registros

✨ Carga de datos completada

📊 Datos en memoria:
   - Desembarques: 220214 registros
   - Materia Prima/Producción: 321993 registros
   - Plantas: 321993 registros

🚀 Servidor ejecutándose en http://localhost:3000
```

#### Terminal 2 - Frontend con Vite
```bash
cd frontend
npm run dev
```

**Salida esperada:**
```
VITE v5.4.21  ready in 360 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Opción 2: Modo Producción

#### Backend
```bash
npm start
```

#### Frontend
```bash
cd frontend
npm run build    # Generar build de producción
npm run preview  # Previsualizar build
```

### Verificar que Todo Funciona

1. **Backend**: Abrir http://localhost:3000 → Debe mostrar mensaje de bienvenida
2. **Frontend**: Abrir http://localhost:5173 → Debe mostrar el dashboard
3. **API**: Probar endpoint → `curl http://localhost:3000/api/v1/cosechas`

---

## 📡 API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### `GET /cosechas`

Obtiene datos de cosechas pesqueras con KPIs calculados y datos para gráficos.

**Query Parameters** (todos opcionales):

| Parámetro | Tipo   | Descripción                                    | Ejemplo       |
|-----------|--------|------------------------------------------------|---------------|
| `anio`    | number | Filtrar por año específico                     | `2013`        |
| `region`  | string | Filtrar por región (case-insensitive)          | `Los Lagos`   |
| `especie` | string | Filtrar por especie (búsqueda parcial)         | `jurel`       |

**Ejemplo de Request:**

```bash
# Sin filtros (todos los datos)
curl http://localhost:3000/api/v1/cosechas

# Filtrar por año
curl http://localhost:3000/api/v1/cosechas?anio=2013

# Filtrar por región
curl "http://localhost:3000/api/v1/cosechas?region=Los%20Lagos"

# Filtros combinados
curl "http://localhost:3000/api/v1/cosechas?anio=2013&region=Los%20Lagos&especie=jurel"
```

**Ejemplo de Response:**

```json
{
  "success": true,
  "filters": {
    "anio": 2013,
    "region": "LOS LAGOS",
    "especie": "JUREL"
  },
  "kpis": {
    "cosechaTotal": 1234567.89,
    "mesesConDatos": 12,
    "especiesDetectadas": 45
  },
  "grafico_mensual": [
    { "mes": 1, "toneladas": 98765.43 },
    { "mes": 2, "toneladas": 87654.32 },
    { "mes": 3, "toneladas": 76543.21 }
  ],
  "grafico_especies": [
    { "especie": "JUREL", "toneladas": 456789.12 },
    { "especie": "SARDINA", "toneladas": 345678.91 },
    { "especie": "ANCHOVETA", "toneladas": 234567.89 }
  ]
}
```

**Campos de Response:**

- `success` (boolean): Indica si la petición fue exitosa
- `filters` (object): Filtros aplicados (normalizados)
- `kpis` (object): Indicadores clave de rendimiento
  - `cosechaTotal`: Total de toneladas capturadas
  - `mesesConDatos`: Cantidad de meses con registros
  - `especiesDetectadas`: Cantidad de especies únicas
- `grafico_mensual` (array): Datos para gráfico de línea temporal
- `grafico_especies` (array): Datos para gráfico de barras (ordenado descendente)

**Códigos de Estado HTTP:**

- `200 OK`: Petición exitosa
- `400 Bad Request`: Parámetros inválidos
- `500 Internal Server Error`: Error del servidor

### Ejemplos de Uso con JavaScript

```javascript
// Usando Fetch API
fetch('http://localhost:3000/api/v1/cosechas?anio=2013')
  .then(response => response.json())
  .then(data => {
    console.log('Total cosecha:', data.kpis.cosechaTotal);
    console.log('Especies:', data.kpis.especiesDetectadas);
  });

// Usando Axios
import axios from 'axios';

const response = await axios.get('http://localhost:3000/api/v1/cosechas', {
  params: {
    anio: 2013,
    region: 'Los Lagos',
    especie: 'jurel'
  }
});

console.log(response.data);
```

---

## 🎨 Frontend Dashboard

### URL de Acceso
```
http://localhost:5173
```

### Componentes del Dashboard

#### 1. **Filtros** (Parte superior)
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard de Cosechas               [Resetear Filtros] │
├─────────────────────────────────────────────────────────────┤
│  Año: [2013 ▼]  Región: [Los Lagos ▼]  Especie: [jurel  ] │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- **Año**: Dropdown con años desde 2000-2024
- **Región**: 16 regiones de Chile
- **Especie**: Campo de texto con búsqueda parcial
- **Resetear**: Limpia todos los filtros

#### 2. **KPI Cards** (Métricas)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 🐟 Cosecha Total│  │ 📅 Meses        │  │ 🦈 Especies     │
│  107.2M ton     │  │  275 meses      │  │  275 especies   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Formato numérico:**
- Millones: `107.2M`
- Miles: `45.6K`
- Cientos: `450`

#### 3. **Gráfico de Tendencia Mensual** (Line Chart)
```
┌─────────────────────────────────────────────────────────────┐
│  📈 Tendencia de Cosecha Mensual                            │
├─────────────────────────────────────────────────────────────┤
│         ╱╲                                                  │
│        ╱  ╲      ╱╲                                         │
│       ╱    ╲    ╱  ╲    ╱╲                                  │
│  ────╱──────╲──╱────╲──╱──╲────────────────────────────    │
│   1  2  3  4  5  6  7  8  9 10 11 12 (Mes)                 │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- Eje X: Meses (1-12)
- Eje Y: Toneladas
- Área rellena bajo la línea
- Tooltips con valores exactos

#### 4. **Gráfico de Top Especies** (Horizontal Bar Chart)
```
┌─────────────────────────────────────────────────────────────┐
│  🐠 Top 10 Especies por Toneladas                           │
├─────────────────────────────────────────────────────────────┤
│  JUREL       ████████████████████████████ 45.6M            │
│  SARDINA     █████████████████████ 34.5M                   │
│  ANCHOVETA   ████████████████ 23.4M                        │
│  MERLUZA     ████████████ 15.6M                            │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- Top 10 especies ordenadas por toneladas
- Barras horizontales con colores
- Valores numéricos al final de cada barra

### Interacción Usuario

1. **Cargar página**: Dashboard muestra todos los datos (sin filtros)
2. **Seleccionar año**: Dropdown actualiza automáticamente
3. **Escribir especie**: Búsqueda en tiempo real mientras escribe
4. **Resetear filtros**: Botón vuelve al estado inicial
5. **Hover en gráficos**: Muestra tooltips con valores exactos

### Configuración de Proxy (Vite)

El archivo `frontend/vite.config.js` ya está configurado:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

Esto permite hacer peticiones a `/api/v1/cosechas` sin especificar el dominio completo.

---

## 🔧 Módulo de Normalización

### `src/utils/normalizar.js`

Módulo centralizado que proporciona 14 funciones reutilizables para:

#### Funciones Básicas
- `normalizarTexto(valor)` - Trim + UPPERCASE
- `parsearDecimal(valor)` - Soporta `1.234,56` y `1,234.56`
- `parsearEntero(valor)` - Parsing robusto de enteros
- `normalizarAnio(valor)` - Valida rango 1900-2100
- `normalizarMes(valor)` - Valida rango 1-12

#### Normalización por Tipo
- `normalizarDesembarque(item)` - Estructura completa de desembarque
- `normalizarMateriaPrima(item)` - Materia prima/producción
- `normalizarPlanta(item)` - Datos de plantas

#### Utilidades de Análisis
- `filtrarDatos(datos, criterios)` - Filtrado multi-criterio
- `obtenerValoresUnicos(datos, campo)` - Valores únicos ordenados
- `agruparYSumar(datos, campo)` - Agrupación + suma de toneladas

**Ejemplo de uso:**
```javascript
const { normalizarTexto, parsearDecimal, filtrarDatos } = require('./src/utils/normalizar');

// Normalizar texto
normalizarTexto('  los lagos  ');  // → 'LOS LAGOS'

// Parsear decimal (ambos formatos)
parsearDecimal('1.234,56');  // → 1234.56
parsearDecimal('1,234.56');  // → 1234.56

// Filtrar datos
filtrarDatos(desembarques, {
  año: 2013,
  region: 'los lagos',  // Se normaliza automáticamente
  especie: 'jurel'
});
```

📖 **Ver documentación completa**: [DOCUMENTACION_NORMALIZAR.md](./DOCUMENTACION_NORMALIZAR.md)

---

## 📂 Estructura del Proyecto

```
Aqua-Data/
├── 📁 src/                                # Código fuente del backend
│   ├── 📁 config/
│   │   └── index.js                       # Configuración centralizada
│   ├── 📁 controllers/
│   │   └── cosechaController.js           # Controlador de endpoints
│   ├── 📁 data/
│   │   └── dataStore.js                   # Almacenamiento en memoria (RAM)
│   ├── 📁 routes/
│   │   └── v1Routes.js                    # Rutas API versión 1
│   ├── 📁 services/
│   │   ├── dataLoaderService.js           # Carga y parseo de CSV
│   │   └── cosechaService.js              # Lógica de negocio
│   └── 📁 utils/
│       └── normalizar.js                  # ⭐ Módulo de normalización
│
├── 📁 frontend/                           # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── KPICard.jsx                # Tarjeta de métrica
│   │   │   ├── LineChart.jsx              # Gráfico de línea (temporal)
│   │   │   ├── BarChart.jsx               # Gráfico de barras (especies)
│   │   │   └── Filters.jsx                # Controles de filtrado
│   │   ├── 📁 services/
│   │   │   └── api.js                     # Cliente Axios para API
│   │   ├── App.jsx                        # Componente raíz
│   │   ├── App.css                        # Estilos globales
│   │   └── main.jsx                       # Punto de entrada
│   ├── index.html                         # HTML principal
│   ├── package.json                       # Dependencias frontend
│   └── vite.config.js                     # Configuración Vite + Proxy
│
├── 📁 Base de Datos/                      # Archivos CSV (no versionados)
│   ├── 📁 BD_desembarque/
│   │   └── BD_desembarque.csv             # 220K registros
│   ├── 📁 BD_materia_prima_produccion/
│   │   └── BD_materia_prima_produccion.csv # 322K registros
│   └── 📁 BD_plantas/
│       └── BD_plantas.csv                 # 322K registros
│
├── 📄 server.js                           # Punto de entrada del backend
├── 📄 package.json                        # Dependencias backend
├── 📄 .env                                # Variables de entorno (no versionado)
├── 📄 .gitignore                          # Archivos ignorados por Git
├── 📄 README.md                           # Este archivo
├── 📄 DOCUMENTACION_NORMALIZAR.md         # Docs del módulo normalizar
├── 📄 PRUEBAS_ENDPOINT.md                 # Ejemplos de pruebas
└── 📄 test-normalizar.js                  # Suite de pruebas
```

### Descripción de Componentes Clave

#### Backend

**`server.js`**
- Entry point de la aplicación
- Carga datos CSV al iniciar
- Inicia servidor Express en puerto 3000

**`src/config/index.js`**
- Centraliza variables de entorno
- Configuración del servidor
- Rutas a archivos CSV

**`src/services/dataLoaderService.js`**
- Carga archivos CSV con `fs` y `csv-parser`
- Usa encoding Latin1 para caracteres españoles
- Delimitador personalizado (`;`)
- Normaliza datos usando módulo `normalizar.js`

**`src/services/cosechaService.js`**
- Lógica de negocio para análisis de cosechas
- Filtra datos según criterios
- Calcula KPIs (totales, promedios, conteos)
- Genera datos para gráficos

**`src/utils/normalizar.js`** ⭐
- Módulo centralizado de normalización
- 14 funciones reutilizables
- Manejo robusto de valores nulos/erróneos
- Soporta formatos numéricos diversos

**`src/data/dataStore.js`**
- Almacena datos en memoria (RAM)
- Getters y setters para 3 datasets
- Acceso rápido sin I/O de disco

#### Frontend

**`App.jsx`**
- Componente contenedor principal
- Gestiona estado de filtros y datos
- Coordina peticiones a API
- Renderiza componentes hijos

**`components/KPICard.jsx`**
- Muestra métricas individuales
- Formato numérico (M/K)
- Props: title, value, unit, icon, color

**`components/LineChart.jsx`**
- Gráfico de tendencia temporal
- Chart.js con área rellena
- Responsive y con tooltips

**`components/BarChart.jsx`**
- Gráfico horizontal de barras
- Top 10 especies por toneladas
- Colores personalizados

**`components/Filters.jsx`**
- Controles de filtrado
- Dropdown año, región
- Input texto para especie
- Callback para cambios

**`services/api.js`**
- Cliente Axios configurado
- Funciones específicas por endpoint
- Manejo de errores centralizado

---

## 🧪 Testing

### Pruebas del Módulo de Normalización

```bash
node test-normalizar.js
```

**Salida esperada:**
```
🧪 Iniciando pruebas del módulo normalizar.js

1️⃣  Test normalizarTexto:
   Input: "  los lagos  " → LOS LAGOS
   Input: null →
   
2️⃣  Test parsearDecimal:
   Input: "1234.56" → 1234.56
   Input: "1.234,56" → 1234.56
   
3️⃣  Test filtrarDatos:
   Datos originales: 4 registros
   Filtrado año=2013: 2 registros
   
✅ Pruebas completadas!
```

### Pruebas del Servicio de Cosechas

```bash
node test-cosecha-service.js
```

### Pruebas Manuales de API

#### Usando cURL

```bash
# Test básico
curl http://localhost:3000/api/v1/cosechas

# Test con filtros
curl "http://localhost:3000/api/v1/cosechas?anio=2013"

# Test múltiples filtros
curl "http://localhost:3000/api/v1/cosechas?anio=2013&region=Los%20Lagos"
```

#### Usando Postman

1. Crear nueva request GET
2. URL: `http://localhost:3000/api/v1/cosechas`
3. Agregar parámetros en la pestaña "Params":
   - `anio`: 2013
   - `region`: Los Lagos
   - `especie`: jurel
4. Enviar y verificar respuesta JSON

#### Usando el Navegador

```
http://localhost:3000/api/v1/cosechas?anio=2013&region=Los%20Lagos&especie=jurel
```

---

## 🐛 Troubleshooting

### Problema: Backend no inicia

**Error**: `Cannot find module 'express'`

**Solución**:
```bash
npm install
```

---

**Error**: `ENOENT: no such file or directory, open 'BD_desembarque.csv'`

**Solución**:
- Verificar que `.env` tiene `CSV_BASE_PATH=./Base de Datos`
- Verificar que los archivos CSV existen en la ruta correcta
- Verificar estructura de carpetas:
  ```
  Base de Datos/
  ├── BD_desembarque/BD_desembarque.csv
  ├── BD_materia_prima_produccion/BD_materia_prima_produccion.csv
  └── BD_plantas/BD_plantas.csv
  ```

---

**Error**: `Port 3000 is already in use`

**Solución**:
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force

# Cambiar puerto en .env
PORT=3001
```

---

### Problema: Frontend no carga datos

**Error**: `ERR_CONNECTION_REFUSED` o `Network Error`

**Solución**:
1. Verificar que el backend está corriendo en `localhost:3000`
2. Verificar que el proxy está configurado en `vite.config.js`:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:3000',
         changeOrigin: true
       }
     }
   }
   ```
3. Reiniciar ambos servidores

---

**Error**: Gráficos no se muestran

**Solución**:
1. Abrir DevTools del navegador (F12)
2. Verificar errores en la consola
3. Verificar que Chart.js está instalado:
   ```bash
   cd frontend
   npm install chart.js react-chartjs-2
   ```

---

### Problema: Datos con caracteres raros

**Error**: Aparecen `�` o caracteres extraños en lugar de `ñ`, `á`, etc.

**Solución**:
- Los CSV deben estar en encoding **Latin1** (ISO-8859-1)
- Verificar que `dataLoaderService.js` usa:
  ```javascript
  fs.createReadStream(filePath, { encoding: 'latin1' })
  ```

---

### Problema: Filtros no funcionan

**Síntomas**: Al aplicar filtros, no se actualizan los datos

**Solución**:
1. Verificar normalización en `cosechaService.js`
2. Abrir DevTools → Network → Verificar request con parámetros
3. Verificar response del API
4. Revisar logs del backend en la terminal

---

### Problema: npm install falla

**Error**: `EACCES: permission denied`

**Solución**:
```bash
# No usar sudo, corregir permisos
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

**Error**: `Conflicting peer dependencies`

**Solución**:
```bash
npm install --legacy-peer-deps
```

---

## 💡 Tips de Desarrollo

### Hot Reload

- **Backend**: Usa `nodemon` - cambios en archivos `.js` recargan automáticamente
- **Frontend**: Vite HMR - cambios en componentes React se reflejan al instante

### Debugging

**Backend:**
```javascript
// Agregar console.log estratégicos
console.log('🔍 Filtros recibidos:', filters);
console.log('📊 Datos filtrados:', filteredData.length);
```

**Frontend:**
```javascript
// React DevTools + Console
console.log('Estado actual:', { filters, data, loading });
```

### Performance

- Los datos están en **RAM** → Consultas ultra rápidas
- Evitar recargar CSV en cada request
- Filtros se aplican sobre datos en memoria

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20.16.0 | Runtime JavaScript |
| Express.js | 4.18.2 | Framework web minimalista |
| csv-parser | 3.0.0 | Parseo de archivos CSV |
| cors | 2.8.5 | Middleware CORS |
| dotenv | 16.3.1 | Variables de entorno |
| nodemon | 3.0.1 | Auto-reload en desarrollo |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Librería UI |
| Vite | 5.4.21 | Build tool + dev server |
| Axios | 1.6.2 | Cliente HTTP |
| Chart.js | 4.4.1 | Gráficos interactivos |
| react-chartjs-2 | 5.2.0 | Wrapper React para Chart.js |

---

## 📊 Datos del Proyecto

### Datasets Cargados

| Dataset | Registros | Descripción |
|---------|-----------|-------------|
| Desembarques | 220,214 | Capturas por puerto, especie, mes |
| Materia Prima | 321,993 | Producción de plantas procesadoras |
| Plantas | 321,993 | Información de plantas industriales |
| **TOTAL** | **864,200** | **Registros en memoria** |

### Cobertura de Datos

- **Temporal**: Desde año 2000 en adelante
- **Geográfica**: 16 regiones de Chile
- **Especies**: Más de 275 especies marinas
- **Granularidad**: Datos mensuales

### Características de los CSV

| Característica | Valor |
|----------------|-------|
| Encoding | Latin1 (ISO-8859-1) |
| Delimitador | Punto y coma (`;`) |
| Formato decimal | Coma (`,`) o punto (`.`) |
| Primera fila | Nombres de columnas |

---

## 📚 Documentación Adicional

- **[DOCUMENTACION_NORMALIZAR.md](./DOCUMENTACION_NORMALIZAR.md)** - Guía completa del módulo de normalización con ejemplos
- **[PRUEBAS_ENDPOINT.md](./PRUEBAS_ENDPOINT.md)** - Casos de prueba y ejemplos de uso del API

---

## 🚀 Roadmap y Mejoras Futuras

### Planeado
- [ ] Exportar datos filtrados a CSV/Excel
- [ ] Más tipos de gráficos (pie, scatter)
- [ ] Comparación entre años/regiones
- [ ] Dashboard de administración
- [ ] Autenticación y roles de usuario

### En Consideración
- [ ] Base de datos persistente (PostgreSQL)
- [ ] Cache con Redis
- [ ] Tests automatizados (Jest, React Testing Library)
- [ ] CI/CD con GitHub Actions
- [ ] Dockerización del proyecto
- [ ] Deploy a producción (AWS/Azure)

---

## 🤝 Contribución

### Cómo Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir un Pull Request

### Guías de Estilo

**JavaScript/React:**
- Usar ES6+ (arrow functions, destructuring, etc.)
- Nombres descriptivos para variables y funciones
- Comentarios JSDoc para funciones públicas
- Componentes funcionales con hooks

**Commits:**
- Usar mensajes descriptivos en español
- Formato: `[Tipo] Descripción corta`
- Tipos: `[Feature]`, `[Fix]`, `[Refactor]`, `[Docs]`

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👨‍💻 Autores

**Proyecto Aqua-Data** - Sistema de análisis de datos pesqueros de Chile

---

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la sección [Troubleshooting](#-troubleshooting)
2. Consulta la [documentación adicional](#-documentación-adicional)
3. Abre un [Issue en GitHub](https://github.com/tu-usuario/Aqua-Data/issues)

---

## 🙏 Agradecimientos

- Datos proporcionados por la industria pesquera chilena
- Comunidad de Node.js y React por las herramientas
- Chart.js por las visualizaciones

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

Hecho con ❤️ para la industria pesquera de Chile

</div>
