# Aqua-Data - Despliegue

## 🚀 Arquitectura de Despliegue

Este proyecto está separado en dos partes:

### Frontend (Vercel)
- **URL**: https://aqua-data.vercel.app
- **Framework**: React + Vite
- **Deploy**: Automático desde GitHub

### Backend (Railway/Render)
- **Framework**: Node.js + Express
- **Datos**: CSV en memoria (348K registros)

## 📋 Instrucciones de Despliegue

### 1. Deploy Frontend en Vercel

```bash
# El frontend ya está configurado en vercel.json
# Solo necesitas:
# 1. Conectar tu repo de GitHub a Vercel
# 2. Framework Preset: Vite
# 3. Root Directory: frontend
# 4. Build Command: npm run build
# 5. Output Directory: dist
```

**Variables de Entorno en Vercel:**
```
VITE_API_URL=https://tu-backend.railway.app/api/v1
```

### 2. Deploy Backend en Railway

#### Opción A: Railway (Recomendado)

1. Ir a [railway.app](https://railway.app)
2. Conectar repositorio GitHub
3. Seleccionar el proyecto
4. Railway detectará automáticamente Node.js
5. Configurar:
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (raíz del proyecto)

#### Opción B: Render

1. Ir a [render.com](https://render.com)
2. New → Web Service
3. Conectar repositorio
4. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 3. Actualizar Frontend con URL del Backend

Una vez desplegado el backend, actualizar la variable de entorno en Vercel:

```bash
VITE_API_URL=https://aqua-data-backend.railway.app/api/v1
```

## 🔍 Verificación

### Backend Health Check
```bash
curl https://tu-backend.railway.app/api/health
```

Respuesta esperada:
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

### Frontend
Visita: `https://aqua-data.vercel.app`

## 🐛 Troubleshooting

### Error: "Network Error" en Frontend
- Verificar que `VITE_API_URL` esté configurada en Vercel
- Verificar que el backend esté corriendo
- Verificar CORS en el backend

### Error: "Cannot find module" en Backend
- Asegurarse que `package.json` tenga todas las dependencias
- Railway/Render ejecutará `npm install` automáticamente

### Error: "Out of Memory" en Backend
- Los CSV son grandes (8.8 MB)
- Asegurarse que el plan tiene al menos 512 MB RAM
- Railway Free tier: 512 MB ✅
- Render Free tier: 512 MB ✅

## 📊 Recursos Utilizados

### Frontend (Vercel)
- Build time: ~2 min
- Bandwidth: Mínimo (solo HTML/JS/CSS)
- Size: ~500 KB

### Backend (Railway/Render)
- RAM: ~300-400 MB con datos cargados
- Storage: Código + CSV = ~10 MB
- Startup time: ~30 segundos (carga de CSV)

## 🔐 Seguridad

- No incluir `.env` en el repositorio
- Usar variables de entorno en ambas plataformas
- El `.gitignore` ya excluye archivos sensibles

## 📝 Comandos Útiles

```bash
# Ver logs del backend en Railway
railway logs

# Redeploy frontend en Vercel
vercel --prod

# Test local con producción
npm run build
npm run preview
```
