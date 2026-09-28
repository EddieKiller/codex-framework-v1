# TechnicalPlan — F002: Tareas con repetición diaria

Estado: propuesta ejecutable posterior a S01 aprobado.

## Diseño y compatibilidad

Mantener `localStorage['f001-tareas']` como array JSON. Las tareas F001 `{id,title,completed}` siguen siendo no recurrentes. Las nuevas usan `{id,title,completed,recurrence:"daily",completedOn:"YYYY-MM-DD"|null}`. Normalizar al leer sin duplicar ni destruir datos; ausencia de `recurrence` significa no recurrente.

Al activar recurrencia en creación o edición: `recurrence:"daily"`, `completedOn:null`, `completed:false`. Al desactivarla, eliminar campos de recurrencia y dejar `completed:false`.

## Reloj y estado derivado

- Crear `todayKey(clock)` con componentes locales del navegador, sin `toISOString()`.
- Separar el reloj de negocio del generador de IDs.
- Producción usa `new Date()`; pruebas podrán definir `globalThis.__F002_TEST_NOW__` antes de cargar la aplicación, sin persistirlo ni mostrarlo.
- Completar recurrente fija `completedOn` al día actual; desmarcarla lo anula.
- Derivar `effectiveCompleted` antes de filtros y render. Cambiar de día sólo cambia el estado derivado, nunca crea una tarea.
- Mantener el contador de F001 como conteo de tareas almacenadas.

## Cambios y archivos

- `src/app.js`: normalización, reloj, estado efectivo, creación, edición, toggle y render.
- `src/index.html`: checkbox accesible “Recurrente diariamente” en creación y edición.
- `src/styles.css`: estilos mínimos para indicador/control si son necesarios.
- `tests/todo.spec.js`: pruebas de recurrencia, cambio de día, compatibilidad y accesibilidad.
- Conservar `Dockerfile`, `compose.yaml`, `tests/Dockerfile` y `nginx.conf` salvo ajustes estrictamente necesarios.

## Verificación

Añadir pruebas Playwright para creación no recurrente, creación recurrente, indicador, completar/desmarcar, recarga, día posterior sin duplicación, filtros, edición, activación/desactivación, eliminación, datos F001, localStorage fallido, teclado y ARIA.

Ejecutar exclusivamente con Docker Desktop:

```powershell
docker compose build --pull=false
docker compose up -d app
docker compose run --rm tests
docker compose down
```

La topología existente (`app` + `tests`, Nginx y Playwright fijados por digest) es suficiente; no añadir backend, servicios, volúmenes ni secretos.

## Riesgos y orden

Riesgos principales: romper datos antiguos, mockear accidentalmente IDs, diferencias de zona horaria y pruebas no reproducibles. Mitigaciones: normalización tolerante, reloj separado, componentes locales e inyección previa a la carga.

Orden: (1) normalización/formato, (2) reloj, (3) estado efectivo, (4) creación/edición, (5) toggle/filtros/render accesible, (6) pruebas Docker, (7) build/healthcheck/pruebas, (8) registrar evidencia.
