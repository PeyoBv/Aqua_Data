# Aqua Data Frontend

Dashboard de visualización de datos de cosechas marinas.

## 🚀 Características

- ✅ React + Vite
- ✅ Chart.js + react-chartjs-2 para gráficos
- ✅ Axios para consumo de API
- ✅ Componentes modulares
- ✅ Diseño responsivo
- ✅ Filtros dinámicos (año, región, especie)

## 📦 Instalación

```bash
cd frontend
npm install
```

## 🏃 Ejecutar

```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## 🔧 Configuración

El proyecto está configurado para hacer proxy de las peticiones `/api` al backend en `http://localhost:3000`.

Asegúrate de que el servidor backend esté corriendo en el puerto 3000.

## 📊 Componentes

- **KPICard** - Tarjetas de indicadores clave
- **LineChart** - Gráfico de líneas para tendencia mensual
- **BarChart** - Gráfico de barras para TOP especies
- **Filters** - Filtros interactivos para año, región y especie

## 🌐 API

El frontend consume el endpoint:
- `GET /api/v1/cosechas?anio=2000&region=Tarapacá&especie=Anchoveta`
