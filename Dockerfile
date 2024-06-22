FROM node:20-alpine AS build-frontendcreadores

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY ./ /app

ARG CLIENT_ID
ARG CLIENT_SECRET

RUN sed -i 's/client_id_antiguo/'"$CLIENT_ID"'/' src/app/servicios/auth.service.ts && \
    sed -i 's/client_secret_antiguo/'"$CLIENT_SECRET"'/' src/app/servicios/auth.service.ts

RUN grep -q "$CLIENT_ID" src/app/servicios/auth.service.ts && \
    grep -q "$CLIENT_SECRET" src/app/servicios/auth.service.ts && \
    echo "Client ID y Client Secret cambiados correctamente" || \
    (echo "Error: No se encontraron los valores esperados" && exit 1)



RUN npm run build

FROM httpd:2.4 AS serve-frontendapp

COPY --from=build-frontendapp /app/dist/frontend-visualizer/browser /usr/local/apache2/htdocs/

EXPOSE 80

CMD ["httpd-foreground"]

