# SecurityReport — R005 / F002

Estado: propuesta de revisión de seguridad

Resultado de salida: `PROVIDE_FEEDBACK`

Decisión requerida: `ESCALATE` a Orchestrator para resolver S07/S08 con este informe persistido. No se aplicaron correcciones ni se contactó al Development Team.

## Alcance y evidencia

Revisión del ChangeSet en `git:working-tree:R005/F002` contra:

- `specs/F002/specification.md`
- `tests/todo.spec.js`
- ExecutionTrace PASS registrado en `.framework/runs/R005/events.jsonl` (`TEST_EXECUTED`, 13 pruebas, Docker build/runtime/tests/config/cleanup PASS)
- `src/app.js`, `src/index.html`, `src/styles.css`, `Dockerfile`, `tests/Dockerfile`, `compose.yaml`, `nginx.conf`, `.dockerignore`, `package-lock.json`

La traza PASS confirma cobertura funcional de recurrencia, persistencia, compatibilidad F001, filtros, ARIA/teclado, localStorage bloqueado, cabeceras HTTP y Docker. La misma traza deja como riesgo residual los elementos corruptos dentro del array JSON y las zonas horarias múltiples.

## Hallazgos priorizados

### F-01 — MEDIO — Elementos corruptos de localStorage pueden bloquear el renderizado

**Referencia:** `src/app.js:15-27, 35-37`.

**Evidencia:** `readTasks()` acepta cualquier array JSON y `normalizeTask()` devuelve sin filtrar los elementos que no sean objetos. Después, `effectiveTask()` accede a `task.recurrence`; un elemento `null` o `undefined` persistido provoca una excepción durante `visibleTasks()`/`render()`. No existe validación de `id`, `title`, `completed`, `recurrence` ni de los límites del array.

**Impacto:** un dato local corrupto, una modificación deliberada desde las DevTools o una escritura realizada por otro script del mismo origen puede producir una denegación de disponibilidad de la interfaz hasta limpiar `localStorage`. No implica acceso a datos de otro origen ni elevación de privilegios.

**Mitigación propuesta:** normalizar a un esquema cerrado y descartar o convertir de forma segura cada elemento inválido antes de renderizar; validar tipos, título y campos de recurrencia; mantener compatibilidad con `{id,title,completed}` de F001. Añadir una prueba con elementos `null`, primitivos y objetos incompletos. No se aplicó el fix en esta revisión.

### F-02 — BAJO/MEDIO — El reloj de prueba queda expuesto en producción

**Referencia:** `src/app.js:30-33`; `tests/todo.spec.js` usa `globalThis.__F002_TEST_NOW__`.

**Evidencia:** `todayKey()` usa cualquier valor truthy de `globalThis.__F002_TEST_NOW__` antes de recurrir a `new Date()`. El valor es globalmente mutable por cualquier script que ejecute en el mismo documento y no se valida como fecha válida.

**Impacto:** se puede alterar localmente el día efectivo de las tareas recurrentes, provocando una clasificación incorrecta como completada/pendiente o `NaN-NaN-NaN` con estado pendiente. El impacto está limitado al cliente y a datos que ya son controlables por el usuario mediante `localStorage`; no hay backend ni cuentas.

**Mitigación propuesta:** eliminar el hook del bundle de producción o habilitarlo solo en el build de pruebas; si debe permanecer, aceptar únicamente un formato ISO válido y aislarlo detrás de una dependencia de reloj inyectada en tests. Añadir una prueba de valor inválido y una verificación de que producción ignora el global.

### F-03 — MEDIO — El runtime no declara ejecución no-root ni restricciones de privilegios

**Referencia:** `Dockerfile`, `tests/Dockerfile`, `compose.yaml`.

**Evidencia:** ambos Dockerfiles no declaran `USER`. `compose.yaml` no declara `read_only`, `cap_drop`, `security_opt: no-new-privileges` ni límites equivalentes. El servicio app publica `8080:80`; no declara volúmenes ni secretos y no usa `privileged`.

**Impacto:** si una vulnerabilidad del servidor estático, del navegador de pruebas o de una dependencia permitiera escape de proceso, el contenedor puede iniciar con privilegios del usuario por defecto de la imagen y con más capacidades que las estrictamente necesarias. La exposición del puerto 8080 es coherente con la topología documentada y no es por sí misma un hallazgo.

**Mitigación propuesta:** ejecutar nginx y el runner de pruebas con usuarios no-root soportados por sus imágenes; aplicar `cap_drop: [ALL]`, `no-new-privileges`, filesystem de solo lectura y un `tmpfs` mínimo si nginx o Playwright lo requieren. Confirmar estas propiedades mediante inspección del contenedor en la evidencia Docker.

### F-04 — BAJO — Proveniencia de imágenes y dependencias no está atestada

**Referencia:** `Dockerfile`, `tests/Dockerfile`, `package-lock.json`.

**Evidencia:** las imágenes base están fijadas por digest (`nginx:1.27.2-alpine` y `mcr.microsoft.com/playwright:v1.52.0-noble`), y las dependencias de pruebas están fijadas en lockfile y se instalan con `npm ci` dentro del contenedor. No hay evidencia en la traza de firma/verificación de imágenes, SBOM, escaneo de vulnerabilidades o allowlist de registries.

**Impacto:** la fijación por digest protege contra cambios posteriores del tag, pero no demuestra por sí sola que el digest provenga de una imagen aprobada ni que no contenga vulnerabilidades conocidas.

**Mitigación propuesta:** registrar provenance/SBOM y resultado de escaneo de las imágenes finales y bases; verificar firmas o attestations según la política del entorno; mantener revisión de dependencias transitivas de Playwright.

## Controles revisados y mitigaciones ya presentes

- **XSS/DOM:** no se observa sink HTML inseguro. Títulos e indicadores se insertan con `textContent`, `append` y `replaceChildren`; el ID solo se usa como `dataset`. La CSP impide scripts inline (`script-src 'self'`) y `object-src 'none'`.
- **Validación:** creación y edición recortan el título y rechazan vacío o más de 120 caracteres. La validación no debe considerarse validación de confianza para datos ya persistidos hasta resolver F-01.
- **localStorage/F001:** se conserva la clave `f001-tareas`; ausencia de `recurrence` se trata como no recurrente y se eliminan campos de recurrencia de esa representación normalizada. El estado diario usa `completedOn` y no crea duplicados.
- **Accesibilidad:** controles con nombres en español, `aria-pressed` en filtros, `aria-label` en checkboxes, foco visible y operación de teclado están cubiertos por la suite PASS. No se observan problemas de XSS derivados de esos nombres.
- **Cabeceras/CSP:** nginx sirve CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `X-Frame-Options: DENY`; la suite confirma sus valores y ausencia de `unsafe-inline`. La política incluye `base-uri 'self'`, `object-src 'none'` y `frame-ancestors 'none'`.
- **Secretos, volúmenes y contexto:** no se declaran secretos ni volúmenes; `.dockerignore` excluye `.framework`, `.codex`, `specs`, `.env*`, claves y resultados. El contexto app es el repositorio filtrado por `.dockerignore`; el contexto de tests usa el Dockerfile específico y copia solo manifiestos y `tests/`.
- **Ejecución Docker:** la traza registra build, runtime, pruebas, healthcheck, configuración y limpieza PASS; las imágenes están fijadas por digest y `npm ci` ocurre dentro de Docker, conforme a la Specification.

## Riesgos residuales

Persisten F-01, F-02, F-03 y F-04 como riesgos no mitigados en el ChangeSet revisado. F-01 es el principal riesgo de disponibilidad/integridad local; F-02 permite manipulación deliberada del día en el cliente; F-03 y F-04 son endurecimiento y cadena de suministro. La suite PASS no cubre todos estos controles.

## Conclusión y recomendación S07/S08

**No queda riesgo crítico sin mitigar:** no se identificó un riesgo de severidad crítica con la evidencia disponible.

Sin embargo, la aprobación incondicional de S07/S08 no es recomendable mientras F-01 y F-03 sigan abiertos. Orchestrator debe decidir si exige corrección y nueva verificación, o si acepta formalmente estos riesgos residuales para este MVP. F-02 y F-04 pueden tratarse como aceptación explícita de riesgo bajo/medio y seguimiento de endurecimiento, con evidencia adicional de build/provenance si la política lo requiere.
