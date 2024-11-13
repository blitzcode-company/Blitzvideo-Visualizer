# Etapa de Construcción
FROM node:20-alpine AS build-frontendcreadores

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY ./ /app

RUN npm run build

# Etapa de Servicio
FROM httpd:2.4 AS serve-frontendapp

COPY --from=build-frontendcreadores /app/dist/frontend-visualizer/browser /usr/local/apache2/htdocs/

EXPOSE 80

CMD ["httpd-foreground"]

