# ExecutionTrace — R005 / F002

Resultado: **FAIL**.

## Alcance y referencias

- Specification: `specs/F002/specification.md`
- TechnicalPlan/SystemMap: `specs/F002/technical-plan.md`, `specs/F002/system-map.md`
- ChangeSet: `git:working-tree:R005/F002`
- TestSuite: `tests/todo.spec.js`
- Handoff de entrada validado: `validate_handoff.py request` → `VALID: request handoff (3 artifact(s))`

## Docker y comandos

- `docker version` → exit code 1 inicialmente por `permission denied` contra `dockerDesktopLinuxEngine`; se reintentó con aprobación técnica de Docker Desktop. El daemon respondió y el build/runtime fueron utilizables.
- `docker compose build --pull=false` → exit code 0. Imágenes app/tests construidas desde imágenes fijadas por digest; `npm ci` ocurrió dentro de la imagen tests.
- `docker compose up -d app` → exit code 0. `codex-framework-v1-app-1` iniciado.
- `docker compose ps` → app `Up`, health `starting`; durante la suite pasó a `Healthy`.
- `docker compose run --rm tests` → exit code 0. Playwright: **8 passed**, 0 failed, 4.9 s.
- `docker compose down --remove-orphans` → exit code 0. App, red y recursos huérfanos eliminados.
- `docker compose config` → exit code 0. Topología sólo `app` + `tests`, healthcheck y dependencia saludable confirmados.
- `docker compose ps -a` posterior → sin contenedores restantes.

## Cobertura

Pasó: build/configuración Docker; creación no recurrente; creación recurrente e indicador textual en español; completar/desmarcar; persistencia en recarga del mismo día; cambio de día sin duplicación; filtros base y filtro de completadas tras cambio de día; edición activación/desactivación; flujo F001; teclado del checkbox de tarea; aviso y memoria en fallo de localStorage; cabeceras HTTP.

Falta cobertura exigida: eliminación recurrente; carga de datos F001 preexistentes directamente desde localStorage; filtro `Pendientes` para recurrente completada hoy; persistencia tras completar y recargar con reloj controlado; accesibilidad/ARIA específica del nuevo checkbox; editar sólo el título de una recurrente sin alterar su estado diario.

## Hallazgo demostrado

`src/app.js:96` asigna `{ recurrence:'daily', completedOn:null, completed:false }` siempre que el checkbox de edición queda marcado. Esto también ocurre cuando la tarea ya era recurrente y sólo se modifica el título. Una recurrente completada hoy pierde su estado al editarse, sin cambio de configuración. Es incompatible con la conservación del comportamiento de edición de F001 y con el reinicio explícito sólo al activar/desactivar recurrencia. Prioridad alta.

## Clasificación y conclusión

- Fallos de ejecución: ninguno; 8/8 pruebas pasaron.
- Defecto demostrado: reinicio indebido al editar una recurrente ya activa.
- Cobertura faltante: el criterio de aceptación 10 no queda satisfecho.
- Riesgo residual: localStorage corrupto/no-array y cambios de zona horaria no tienen pruebas dirigidas.

La infraestructura Docker y la suite existente son reproducibles y verdes, pero el ChangeSet no supera la verificación completa de F002. No se modificó código de producción.
