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

# Comando para substituir as variáveis no template e iniciar o nginx
CMD ["/bin/sh", "-c", "envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
