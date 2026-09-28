# TechnicalPlan — F001

Estado: propuesta ejecutable posterior a S01 aprobado.

## Evidencia y decisiones

- Evidencia: [Specification](specification.md), [TaskList](specification.md#task-list), [SystemMap](system-map.md), base `git:f9954b8c5adda36a4cfd70fcc30199d0b50d7ebd`.
- El scaffold no contiene aplicación, dependencias, pruebas ni configuración Docker; se crea la primera estructura.
- Tecnología mínima: HTML semántico, CSS y JavaScript modular sin backend ni framework; `localStorage` satisface la persistencia aprobada.
- Runtime: `nginx:1.27.2-alpine`, un solo contenedor; ningún servicio de soporte, volumen persistente o secreto (los datos viven en el navegador).

## Estructura propuesta

```text
src/index.html
src/styles.css
src/app.js
tests/todo.spec.js
package.json
package-lock.json
Dockerfile
nginx.conf
compose.yaml
tests/Dockerfile
```

`app.js` encapsula el modelo de tarea, validación de 1–120 caracteres recortados, filtros, renderizado accesible y persistencia con aviso en español ante fallo de `localStorage`. `index.html` proporciona controles nombrados para teclado y estados iniciales/vacíos.

## Docker Desktop versionado y ejecución

- `Dockerfile`: etapa final `nginx:1.27.2-alpine`; copia `src/` y `nginx.conf`; expone `80`; healthcheck HTTP sobre `/healthz`.
- `nginx.conf`: sirve `/`, niega listado de directorios y devuelve `200` para `/healthz`.
- `tests/Dockerfile`: `mcr.microsoft.com/playwright:v1.52.0-noble`; instala con `npm ci` y ejecuta Playwright contra `http://app`.
- `compose.yaml`: servicios `app` y `tests`, red interna por defecto, sin secretos; `tests` depende de `app` con `condition: service_healthy`.
- Puerto publicado: `8080:80` (`http://localhost:8080`). No se publican puertos de pruebas.
- No se definen volúmenes de aplicación; opcionalmente `test-results` como volumen de salida efímera de pruebas, nunca como persistencia funcional.

Comandos, siempre desde Docker Desktop:

```text
docker compose build
docker compose up -d app
docker compose run --rm tests
docker compose down --remove-orphans
```

La configuración y las imágenes llevan versiones explícitas; no se requieren Node, npm, navegador ni dependencias instalados en el host.

## Implementación ordenada

1. Crear la estructura anterior y el shell accesible en español.
2. Implementar operaciones CRUD, completar/descompletar, filtros y renderizado.
3. Implementar carga/guardado en `localStorage`, manejo de error y recarga.
4. Añadir Dockerfile, `nginx.conf`, `tests/Dockerfile` y `compose.yaml`.
5. Añadir pruebas Playwright para estado inicial, creación válida/ inválida, cambio de estado, edición, eliminación, filtros, teclado y recarga.

## Verificación y riesgos

Verificar `docker compose build`, healthcheck, apertura en Chrome/Edge estable de Windows en `:8080`, y `docker compose run --rm tests`; registrar la salida como TestSuite/ExecutionTrace. Riesgos: diferencias de almacenamiento del navegador (mitigadas mostrando aviso y manteniendo estado en memoria) y variación entre navegadores objetivo (mitigada con pruebas Chromium y validación manual en Chrome/Edge). No se introducen migraciones ni compatibilidad de API.

## Supuestos explícitos

El alcance permite una SPA estática sin proceso de build adicional; Playwright es la única dependencia de pruebas y se instala dentro de su contenedor. Si la implementación exige framework, backend o servicio auxiliar, requerirá una decisión fuera de este plan y no forma parte de F001 aprobado.
