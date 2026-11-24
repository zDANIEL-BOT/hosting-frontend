# Etapa 1: Compilación
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5157
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa 2: Servidor web
FROM nginx:alpine AS final

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
