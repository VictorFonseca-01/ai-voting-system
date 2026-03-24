# Etapa 1: Build (Node.js)
FROM node:18-alpine AS build

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --legacy-peer-deps

# Copia o restante do código fonte
COPY . .

# Gera o build de produção
RUN npm run build

# Etapa 2: Produção (Nginx)
FROM nginx:stable-alpine

# Copia o build da etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Copia o template de configuração do Nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Define variáveis de ambiente padrão para o Nginx (Railway sobrescreve $PORT)
ENV PORT=80

# O Nginx oficial no Docker suporta variáveis de ambiente em templates automaticamente
# se os arquivos estiverem em /etc/nginx/templates/ com extensão .template.
# Ele roda envsubst internamente e gera o /etc/nginx/conf.d/default.conf

# Comando para rodar o Nginx no foreground
CMD ["nginx", "-g", "daemon off;"]
