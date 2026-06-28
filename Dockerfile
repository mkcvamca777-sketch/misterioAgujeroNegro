# Etapa 1: Construcción (Build)
FROM node:18-alpine AS builder
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto (genera la carpeta dist)
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiamos la carpeta dist compilada al directorio público de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 para Dockploy
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]
