# SystemMap — F002

## Entrypoints y runtime

- `src/index.html` carga `src/app.js` como módulo y `src/styles.css`.
- `src/app.js` concentra estado, persistencia, lógica y renderizado; no existe backend.
- `Dockerfile`, `compose.yaml` y `tests/Dockerfile` sirven/probar la SPA con Nginx y Playwright versionados por digest. `app` expone `localhost:8080` y tiene healthcheck; `tests` depende de app saludable.
- `nginx.conf` configura `/healthz`, CSP y cabeceras defensivas.

## Modelo y flujo observado

- `STORAGE_KEY = 'f001-tareas'`; `readTasks()`/`saveTasks()` serializan un array JSON en localStorage.
- Modelo F001 observado: `{ id, title, completed }`; tareas antiguas no tienen campos de recurrencia y deben interpretarse como no recurrentes.
- `visibleTasks()` filtra directamente por `task.completed`; `render()` usa ese campo para clase `.completed`, checkbox, etiqueta accesible, filtros y estado vacío.
- `#task-count` cuenta tareas almacenadas.
- Creación y actualización convergen en `updateTask()`/submit handler; `startEdit()` hoy sólo edita título; eliminación filtra por `id`.
- `Date.now()` sólo se usa para IDs, pero debe separarse del reloj de negocio para pruebas.

## UI y pruebas

- Cada tarea se renderiza como `li.task` con checkbox, `span.task-title`, botones Editar/Eliminar.
- `tests/todo.spec.js` usa Playwright contra `http://app` y ya cubre validación, completado, edición, filtros, eliminación, recarga, teclado y fallo de localStorage.
- No hay abstracción de reloj ni cobertura de recurrencia/cambio de día/migración.

## Puntos de cambio para F002

1. Introducir una única fuente del día local, separada del generador de IDs y controlable en pruebas.
2. Añadir la representación persistida de recurrencia/último día completado sin romper objetos F001 ni cambiar innecesariamente la clave existente.
3. Derivar un estado efectivo diario antes de `visibleTasks()` y `render()`, para que filtros y presentación compartan semántica.
4. Extender creación y edición con recurrencia, y renderizar etiqueta textual accesible “Recurrente diariamente”.
5. Probar cambio de día sin esperar tiempo real, sin crear tareas duplicadas.

## Riesgos

- Sobrescribir la forma persistida puede romper datos existentes; se requiere normalización compatible.
- Mockear el reloj global puede afectar IDs si no se desacopla.
- La topología Docker no requiere cambios, pero las pruebas multi-día sí requieren inyección de reloj en la aplicación o Playwright.
- Debe decidirse en el TechnicalPlan si el contador cuenta tareas almacenadas o estados efectivos; la Specification sólo exige filtros correctos.
