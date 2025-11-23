# Usamos una imagen base ligera de Node
FROM node:18-bullseye-slim

# --- CAPA DE SISTEMA OPERATIVO ---
# Instalamos Python 3, Pip y herramientas de compilación (necesarias para Prophet)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# --- CAPA DE DEPENDENCIAS ---
# Copiamos package.json e instalamos dependencias de Node
COPY package*.json ./
RUN npm install

# Instalamos dependencias de Python (Prophet y Pandas)
RUN pip3 install pandas prophet

# --- CAPA DE CÓDIGO Y BUILD ---
# Copiamos todo el código fuente
COPY . .

# Entramos al frontend, instalamos y construimos el sitio estático
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Volvemos a la raíz
WORKDIR /app

# --- CAPA DE PRE-CALCULO ---
# Ejecutamos el script de IA una vez para generar el JSON inicial
RUN python3 scripts/predict_harvest.py || echo "Warning: Prophet build step failed, continuing..."

# --- CAPA DE EJECUCIÓN ---
EXPOSE 3000
CMD ["node", "server.js"]
