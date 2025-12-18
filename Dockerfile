# Etapa de build
FROM node:20-alpine AS build

# Instale o pnpm globalmente
RUN npm install -g pnpm

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instale as dependências
RUN pnpm install

# Copie o resto do código
COPY . .

# Passe as variáveis de ambiente como build-args
ARG NEXT_PUBLIC_API_URL

# Defina as variáveis de ambiente para o build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Construa o app para produção
RUN pnpm run build

# Etapa final: imagem de produção
FROM node:20-alpine AS runner

# Instale o pnpm na imagem final também
RUN npm install -g pnpm

# Defina o diretório de trabalho
WORKDIR /app

# Defina o ambiente de produção
ENV NODE_ENV=production

# Passe as variáveis de ambiente para o runtime também
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copie o build da etapa anterior
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

# Exponha a porta padrão do NextJS (3000)
EXPOSE 3000

# Comando para rodar o app
CMD ["pnpm", "start"]