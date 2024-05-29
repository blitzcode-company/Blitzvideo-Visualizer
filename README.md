    # Blitzvideo-FrontendVisualizer
- Vamos a nuestro directorio del frontend e instalamos las dependencias con el siguiente comando:
     - npm install
- Luego nos dirigimos al servicio de auth
     - (./FrontendApp/src/app/servicios/auth.service.ts)
  De ahi reemplazamos el client_id y el client_secret que estan dentro del codigo por los que generamos recien y guardamos los cambios.
- Dentro de nuestro directorio de (./FrontendApp) compilamos el proyecto de Angular
    -  ("ng build")
- A continuacion creamos un archivo llamado "dockerfile" dentro del directorio que se acaba de generar
     - (./frontendVisualizer/dist/frontend.visualizer/)
- Dentro de el archivo "dockerfile" escribiremos lo siguiente:
    -  "FROM httpd 
    -  COPY ./browser/ /usr/local/apache2/htdocs"
  (Hay que fijarse bien si el directorio tiene el nombre de "browser", por lo contrario se cambia)
- Luego dentro del mismo directorio, generaremos la imagen de Apache, escribiendo lo siguiente:
    -  docker build -t frontendvisualizer-apache .
- Despues de generar la imagen, levantamos el proyecto de docker con el siguiente comando dentro de el directorio de donde tengamos los proyectos
    -  docker-compose up -d
