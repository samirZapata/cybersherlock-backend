# syntax = docker/dockerfile:1

# Stage 1: Building
FROM node:18.18.2-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Configuration and Running
FROM node:16-bullseye-slim AS runtime

ENV NODE_ENV production

WORKDIR /app

# Remove previous copies of dist
RUN rm -rf /app/dist

# Copy only contents of dist instead of entire folder
COPY --from=build /app/dist/* /app/dist/

RUN apt-get update && apt-get install -y \
    libicu-dev \
    libssl-dev \
    cargo \
&& rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2@latest typescript ts-node@latest && \
    rm -rf /tmp/*

# Create scripts folder
RUN mkdir /app/scripts

# Copy configureUploads.sh
COPY --from=build /app/scripts/configureUploads.sh /app/scripts
RUN chmod +x /app/scripts/configureUploads.sh

# Run configureUploads.sh
RUN /app/scripts/configureUploads.sh

USER root

EXPOSE 9000

CMD ["pm2", "start", "dist/index.js"]