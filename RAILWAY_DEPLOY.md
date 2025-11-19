# 🚂 Guía de Despliegue en Railway

## Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Login" y usa tu cuenta de GitHub
3. Autoriza Railway para acceder a tus repositorios

## Paso 2: Crear Nuevo Proyecto

1. En el dashboard, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona el repositorio **`PeyoBv/Aqua_Data`**
4. Railway detectará automáticamente que es un proyecto Node.js

## Paso 3: Configuración Automática

Railway configurará automáticamente:
- ✅ Build Command: `npm install`
- ✅ Start Command: `npm start` (definido en `package.json`)
- ✅ Puerto: Variable `PORT` (Railway lo asigna dinámicamente)
- ✅ Node.js version: >= 18.0.0 (definido en `package.json`)

## Paso 4: Esperar el Deploy

El deploy tomará aproximadamente **2-3 minutos**:

```
📦 Instalando dependencias (npm install)...
📂 Cargando CSV files...
🚀 Iniciando servidor...
✅ Deploy exitoso
```

Verás en los logs:
```
📊 Datos en memoria:
   - Desembarques: 72096 registros
   - Materia Prima/Producción: 138056 registros
   - Plantas: 138056 registros

🚀 Servidor ejecutándose en http://0.0.0.0:XXXX
```

## Paso 5: Obtener la URL del Backend

1. Una vez desplegado, Railway te dará una URL pública
2. Haz clic en **"Settings"** → **"Networking"**
3. Copia la URL que será algo como:
   ```
   https://aqua-data-production.up.railway.app
   ```

## Paso 6: Probar el Backend

Abre en tu navegador:
```
https://tu-backend.railway.app/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Servidor Express funcionando correctamente",
  "data": {
    "desembarques": 72096,
    "materiaPrimaProduccion": 138056,
    "plantas": 138056
  }
}
```

## Paso 7: Conectar Frontend con Backend

### En Vercel:

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega la variable:
   ```
   VITE_API_URL=https://tu-backend.railway.app/api/v1
   ```
4. **Redeploy** el proyecto (Deployments → tres puntos → Redeploy)

### Verificar en Local:

Puedes probar localmente con:
```bash
# En frontend/
VITE_API_URL=https://tu-backend.railway.app/api/v1 npm run dev
```

## 🎯 Resultado Final

**Backend (Railway):**
- URL: `https://aqua-data-production.up.railway.app`
- Endpoints:
  - `/api/health` - Health check
  - `/api/v1/general?region=Lagos` - Panorama regional
  - `/api/v1/explorador` - Explorador de datos

**Frontend (Vercel):**
- URL: `https://aqua-data.vercel.app`
- Conectado al backend de Railway

## 📊 Monitoreo

En Railway puedes:
- Ver logs en tiempo real
- Monitorear uso de memoria (~400 MB con datos cargados)
- Ver métricas de requests
- Configurar alertas

## 🔧 Troubleshooting

### Error: "Cannot find module"
- Railway ejecutará `npm install` automáticamente
- Verifica que `package.json` tenga todas las dependencias

### Error: "Out of Memory"
- Los CSV ocupan ~400 MB en memoria
- Railway Free tier tiene 512 MB RAM ✅
- Si es necesario, actualiza a plan Pro ($5/mes)

### Error: "Port already in use"
- Railway asigna el puerto automáticamente vía `process.env.PORT`
- No necesitas configurar nada manualmente

### Logs no muestran datos cargados
- Los CSV están en `Base de Datos/` y se cargan al iniciar
- Verifica en logs que aparezca: "📊 Datos en memoria:"

## 💰 Costos

**Railway Free Tier:**
- ✅ 500 horas/mes de ejecución
- ✅ 512 MB RAM (suficiente para este proyecto)
- ✅ 1 GB disco
- ✅ Banda ancha compartida

**Estimado para este proyecto:**
- RAM: ~400 MB (con datos en memoria)
- CPU: Mínimo (solo procesa requests)
- Disco: ~10 MB (código + CSV)

**Recomendación:** El plan gratuito es suficiente para desarrollo y demos. Para producción con alto tráfico, considera el plan Pro.

## 🔄 Auto-Deploy

Railway hará auto-deploy automáticamente cuando:
- Hagas `git push` al repositorio
- Cambios en la rama `main`

Puedes desactivar esto en Settings si prefieres deploy manual.

## ✅ Checklist de Deploy

- [ ] Crear proyecto en Railway
- [ ] Conectar repo GitHub
- [ ] Esperar deploy (2-3 min)
- [ ] Copiar URL del backend
- [ ] Agregar `VITE_API_URL` en Vercel
- [ ] Redeploy frontend en Vercel
- [ ] Probar `/api/health`
- [ ] Verificar frontend funciona con datos
