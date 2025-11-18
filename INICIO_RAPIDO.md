# 🚀 Inicio Rápido - Aqua-Data

Guía para levantar el proyecto en **menos de 5 minutos**.

---

## ⚡ Pasos Rápidos

### 1. Instalar Dependencias (Solo primera vez)

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
PORT=3000
NODE_ENV=development
CSV_BASE_PATH=./Base de Datos
```

### 3. Levantar Servidores

#### Terminal 1 - Backend
```bash
npm run dev
```

Espera ver:
```
✅ BD_desembarque.csv cargado: 220214 registros
✅ BD_materia_prima_produccion.csv cargado: 321993 registros
✅ BD_plantas.csv cargado: 321993 registros
🚀 Servidor ejecutándose en http://localhost:3000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Espera ver:
```
VITE v5.4.21  ready in 360 ms
➜  Local:   http://localhost:5173/
```

### 4. Abrir el Dashboard

Navegar a: **http://localhost:5173**

---

## ✅ Verificación Rápida

### Test del Backend
```bash
curl http://localhost:3000/api/v1/cosechas
```

Debe retornar JSON con datos de cosechas.

### Test del Frontend
Abrir http://localhost:5173 en el navegador → Debe mostrar:
- 3 KPI cards con números
- Gráfico de línea (tendencia mensual)
- Gráfico de barras (top especies)
- Controles de filtrado

---

## 🐛 Solución de Problemas Comunes

### Backend no inicia
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Frontend no conecta al API
1. Verificar que backend está en `localhost:3000`
2. Verificar `vite.config.js` tiene el proxy configurado
3. Reiniciar ambos servidores

### Puerto ocupado
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force

# Luego reiniciar
npm run dev
```

---

## 📝 Comandos Útiles

```bash
# Detener todos los procesos Node.js
Get-Process -Name node | Stop-Process -Force

# Ver logs del backend
npm run dev  # (ya incluye logs automáticos)

# Probar módulo de normalización
node test-normalizar.js

# Build de producción (frontend)
cd frontend
npm run build
```

---

## 📚 Documentación Completa

Ver [README.md](./README.md) para documentación detallada de:
- Arquitectura completa
- API Reference
- Componentes del Dashboard
- Módulo de Normalización
- Troubleshooting avanzado

---

## 🎯 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api/v1/cosechas

---

**¡Listo! Ya tienes el proyecto corriendo** 🎉
