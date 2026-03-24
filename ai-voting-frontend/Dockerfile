# Etapa 1: Build (Node.js)
FROM node:18-alpine AS build

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala as dependências (usa ci para builds reprodutíveis se houver lockfile estável)
RUN npm install --legacy-peer-deps

# Copia o restante do código fonte
COPY . .

# Gera o build de produção
RUN npm run build

# Etapa 2: Produção (Nginx)
FROM nginx:stable-alpine

# Copia o build da etapa anterior para o diretório padrão do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Comando para rodar o Nginx no foreground
CMD ["nginx", "-g", "daemon off;"]
