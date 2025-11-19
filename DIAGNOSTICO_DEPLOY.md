# 🔍 Diagnóstico de Despliegue - Aqua Data

**Fecha:** 19 de noviembre de 2025  
**Commit actual:** `0a81b26`

---

## ❌ Problemas Identificados

### 1. **Railway NO tiene los cambios del backend**

**Evidencia:**
```bash
# Este endpoint NO existe en Railway:
https://web-production-af947.up.railway.app/api/v1/explorador/opciones-disponibles
# Error: Cannot GET /api/v1/explorador/opciones-disponibles

# Pero el servidor SÍ está corriendo:
https://web-production-af947.up.railway.app/
# Response: {"message":"Servidor Express funcionando correctamente","version":"1.0.0"}
```

**Causa:**
- Railway NO tiene configurado auto-deploy desde GitHub
- El código desplegado es de una versión antigua
- Los commits `d644e48` y `0a81b26` NO están en producción

### 2. **Frontend sin variable de entorno**

**Falta:**
```bash
# frontend/.env NO existía
VITE_API_URL=https://web-production-af947.up.railway.app/api/v1
```

**Impacto:**
- El frontend estaba intentando llamar a `/api/v1` (ruta local)
- No se conectaba al backend de Railway

---

## ✅ Soluciones Implementadas

### Backend (Commit `0a81b26`)

**Archivos modificados:**

1. **`src/controllers/exploradorController.js`**
   - ✅ Agregado método `obtenerOpcionesDisponibles()`
   - Devuelve años, especies, tipos de elaboración disponibles

2. **`src/routes/v1Routes.js`**
   - ✅ Agregada ruta: `GET /api/v1/explorador/opciones-disponibles`

3. **`frontend/src/services/api.js`**
   - ✅ Agregada función `obtenerOpcionesDisponibles()`

4. **`frontend/src/components/ExploradorDatos.jsx`**
   - ✅ Ahora carga opciones desde API al inicio
   - Usa `obtenerOpcionesDisponibles()` en lugar de metadata

### Frontend

5. **`frontend/.env`** (CREADO)
   ```env
   VITE_API_URL=https://web-production-af947.up.railway.app/api/v1
   ```

---

## 🚀 Próximos Pasos para Deploy

### Opción A: Auto-Deploy en Railway (Recomendado)

1. **Ir a Railway Dashboard:**
   - https://railway.app/dashboard
   - Selecciona el proyecto "Aqua Data"

2. **Configurar Auto-Deploy:**
   - Settings → GitHub Repo
   - Verifica que esté conectado a `PeyoBv/Aqua_Data`
   - Branch: `main`
   - ✅ Enable "Auto Deploy"

3. **Trigger Manual Deploy:**
   - Click en "Deploy Now" o
   - Settings → "Redeploy"

4. **Esperar 2-3 minutos** hasta ver en logs:
   ```
   📊 Datos en memoria:
      - Desembarques: 72096 registros
      - Materia Prima/Producción: 138056 registros
   🚀 Servidor ejecutándose
   ```

### Opción B: Deploy Manual con Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Deploy
railway up
```

---

## 🧪 Verificación Post-Deploy

### 1. Verificar Backend Railway

```bash
# PowerShell
Invoke-WebRequest -Uri "https://web-production-af947.up.railway.app/api/v1/explorador/opciones-disponibles" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Respuesta esperada:**
```json
{
  "success": true,
  "opciones": {
    "años_disponibles": [2018, 2019, 2020, 2021, 2022, 2023],
    "especies_disponibles": ["Salmon Atlantico", "Salmon Coho", ...],
    "tipos_elaboracion": ["Congelado", "Fresco-Refrigerado", ...]
  }
}
```

### 2. Verificar Frontend en Vercel

**Vercel debe tener la variable de entorno:**

1. Ve a: https://vercel.com/dashboard
2. Proyecto → Settings → Environment Variables
3. **Agregar si NO existe:**
   ```
   Name: VITE_API_URL
   Value: https://web-production-af947.up.railway.app/api/v1
   ```

4. **Redeploy:**
   - Deployments → Latest → ... → Redeploy

### 3. Probar en el navegador

```
https://tu-app.vercel.app/
```

- ✅ Los dropdowns de filtros deben mostrar opciones (no solo "Todos")
- ✅ Años: 2018, 2019, 2020, 2021, 2022, 2023
- ✅ Especies: Salmon Atlantico, Salmon Coho, etc.
- ✅ Tipos: Congelado, Fresco-Refrigerado, etc.

---

## 📊 Estado Actual

### Código (GitHub)
```
✅ Commit 0a81b26 pushed
✅ Backend actualizado con endpoint opciones-disponibles
✅ Frontend actualizado con .env
✅ ExploradorDatos usa nuevo endpoint
```

### Backend (Railway)
```
⚠️ Versión antigua desplegada
❌ Endpoint opciones-disponibles NO existe
⚠️ Necesita redeploy manual o configurar auto-deploy
```

### Frontend (Vercel)
```
⚠️ Puede estar sin variable VITE_API_URL
❌ Dropdowns no funcionan (falta backend)
⚠️ Necesita verificar variable de entorno
```

---

## 🎯 Checklist de Deploy

- [x] Código actualizado en GitHub (commit `0a81b26`)
- [x] Backend: endpoint opciones-disponibles creado
- [x] Frontend: .env creado con VITE_API_URL
- [x] Frontend: ExploradorDatos actualizado
- [ ] **Railway: Configurar auto-deploy**
- [ ] **Railway: Hacer redeploy manual**
- [ ] **Vercel: Agregar VITE_API_URL si falta**
- [ ] **Vercel: Redeploy**
- [ ] Verificar endpoint opciones-disponibles funciona
- [ ] Verificar dropdowns muestran opciones

---

## 📝 Notas

### Diferencias entre Vercel y Railway:

| Feature | Vercel | Railway |
|---------|--------|---------|
| Auto-deploy desde GitHub | ✅ Automático | ⚠️ Requiere configuración |
| Build triggers | ✅ Push a main | ⚠️ Manual o webhook |
| Variables de entorno | ✅ En dashboard | ✅ En dashboard |
| Logs en tiempo real | ✅ Sí | ✅ Sí |

### Endpoints Backend (Railway):

```
GET  /                                          # Health check
GET  /api/v1/general?region=LAGOS              # Panorama general
GET  /api/v1/explorador?tipo_dato=cosecha      # Explorar datos
GET  /api/v1/explorador/opciones-disponibles   # 🆕 Opciones para filtros
GET  /api/v1/cosechas                          # Legacy endpoint
```

### Commits Relevantes:

```bash
0a81b26  Fix: Add opciones-disponibles endpoint for filter dropdowns
a2a9317  Add Python Analytics Module
d644e48  Fix: Add metadata with available options
192728c  Fix: Remove duplicate code in App.jsx
```
