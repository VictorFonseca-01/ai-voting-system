# ─── Stage 1: Build React ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copia package.json e instala dependências (cache layer)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copia código-fonte e faz o build de produção
COPY public ./public
COPY src ./src

# Em Docker, nginx faz proxy de /api -> backend:8080
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ─── Stage 2: Serve com Nginx ────────────────────────────────────
FROM nginx:alpine
RUN apk add --no-cache gettext
WORKDIR /usr/share/nginx/html

# Remove config padrão do nginx
RUN rm -rf ./*

# Copia os arquivos do build React
COPY --from=builder /app/build .

# Copia a template do nginx
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Script de inicialização para injetar a variável BACKEND_URL
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "window.ENV = { API_URL: \"${BACKEND_URL:-http://localhost:8080/api}\" };" > /usr/share/nginx/html/env-config.js' >> /start.sh && \
    echo 'envsubst '"'"'${PORT}'"'"' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Inicia o container com o script
CMD ["/start.sh"]
