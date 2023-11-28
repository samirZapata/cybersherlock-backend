# syntax = docker/dockerfile:1

#ETAPA DE CONSTRUCCION
# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.18.2
FROM node:${NODE_VERSION}-slim as build

LABEL fly_launch_runtime="Node.js"

#Directorio de trabajo para etapa de construccion
WORKDIR . .

#Instalar dependencias de construccion
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

#Copiar archivos de configuracion de Node.js
COPY package.json package-lock.json ../
RUN npm ci --include=dev

#Copiar el codigo de la aplicacion
COPY . .

#Construir la aplicacion
RUN npm run build

#Etapa final 
FROM node:${NODE_VERSION}-slim as final
#Directorio de trabajo para etapa final
WORKDIR . .
#Copiar archivos de construccion a etapa final
COPY --from=build . .
#Exponer el puerto
EXPOSE 9000

#Comando de inicio
CMD ["npm", "start"]