# ValidaciÃ³n manual de F001

Con Docker Desktop activo, ejecutar `docker compose build`, `docker compose up -d app` y abrir `http://localhost:8080` en la Ãºltima versiÃ³n estable de Chrome y Edge para Windows.

En cada navegador comprobar:

- crear una tarea, marcarla y desmarcarla, editarla, eliminarla y filtrar por todas, pendientes y completadas;
- realizar la creaciÃ³n y el cambio de estado usando teclado, y confirmar nombres comprensibles de los controles;
- confirmar que una tarea completada usa tachado y estado visual distinto;
- recargar y confirmar la persistencia en el mismo perfil;
- bloquear o denegar el almacenamiento del sitio y confirmar el aviso en espaÃ±ol y la conservaciÃ³n durante la sesiÃ³n.

La suite automatizada reproducible se ejecuta con `docker compose run --rm tests`; al finalizar, limpiar con `docker compose down --remove-orphans`.

## Resultados reportados

El Equipo de Desarrollo confirma que la validación manual fue completada en la última versión estable de Chrome y Edge sobre Windows, cubriendo los escenarios indicados. No se reportaron fallos.
