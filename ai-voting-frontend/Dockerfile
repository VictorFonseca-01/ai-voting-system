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
WORKDIR /usr/share/nginx/html

# Remove config padrão do nginx
RUN rm -rf ./*

# Copia os arquivos do build React
COPY --from=builder /app/build .

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
