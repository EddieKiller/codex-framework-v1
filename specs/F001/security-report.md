# SecurityReport — F001 (propuesta actualizada, R004)

## Resultado

**PROVIDE_FEEDBACK** al Orchestrator. La reauditoría contrasta la Specification, el ChangeSet del working tree, `tests/todo.spec.js` y `.framework/runs/R004/events.jsonl`. Se confirman SEC-01, SEC-02 y SEC-04 en el código/configuración actuales. SEC-03, SEC-05 y SEC-06 no fueron aplicados.

**Riesgo crítico no mitigado: no observado.** Persisten riesgos residuales no críticos de provenance verificable de imágenes/dependencias, runtime root y validación de datos locales.

## Evidencia de mitigaciones seleccionadas

### F001-SEC-01 — Contexto de build

- **Estado:** Mitigado en parte sustantiva; evidencia confirmada.
- **Evidencia:** `.dockerignore:1-12` excluye `.git`, `.framework`, `.codex`, `.venv`, `specs`, `node_modules`, resultados de pruebas, `.env*`, documentación y claves/certificados (`*.pem`, `*.key`). `Dockerfile:2-3` y `tests/Dockerfile:3-5` copian únicamente rutas explícitas.
- **Riesgo residual:** El contexto sigue siendo la raíz del repositorio (`compose.yaml:3,12-14`); no hay evidencia independiente de inspección del contexto enviado ni de exclusión de todos los posibles nombres de secretos.
- **Mitigación restante:** Mantener revisión del contexto y ampliar patrones de secretos según la política de entrega; preferir contextos mínimos por servicio si Docker Desktop lo permite.

### F001-SEC-02 — Imágenes base y provenance

- **Estado:** Digest confirmado; provenance de la cadena no demostrada.
- **Evidencia:** `Dockerfile:1` usa `nginx:1.27.2-alpine@sha256:74175cf...`; `tests/Dockerfile:1` usa `mcr.microsoft.com/playwright:v1.52.0-noble@sha256:a021500...`. Las versiones y los identificadores inmutables están fijados.
- **Riesgo residual:** No se aporta evidencia de firma, verificación de provenance, SBOM ni escaneo de vulnerabilidades. El lockfile fija Playwright 1.52.0, pero no prueba integridad/provenance adicional del registry (`package-lock.json:1`).
- **Severidad:** Media-baja, supply chain/build; no crítica para esta SPA sin dependencias runtime.
- **Mitigación:** Verificar firmas/provenance y vulnerabilidades de ambas imágenes, generar/archivar SBOM y aplicar controles equivalentes a los artefactos npm antes de publicar.

### F001-SEC-04 — Cabeceras nginx/CSP

- **Estado:** Mitigado y cubierto por prueba automatizada.
- **Evidencia:** `nginx.conf:6-9` define CSP con `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `object-src 'none'` y `frame-ancestors 'none'`, sin `unsafe-inline`, además de `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `X-Frame-Options: DENY`. `tests/todo.spec.js:5-13` verifica estos valores.
- **Nota:** No se añade HSTS porque el contenedor sólo escucha HTTP (`nginx.conf:2`); debe evaluarse al terminar detrás de HTTPS exclusivo.

## Confirmación de hallazgos diferidos

### F001-SEC-03 — Runtime no-root y privilegios

- **Estado:** No aplicado.
- **Evidencia:** Ningún `USER` en `Dockerfile` ni `tests/Dockerfile`; `compose.yaml:1-17` no define `user`, `cap_drop`, `read_only`, `security_opt` ni `privileged`. La imagen de nginx conserva sus defaults de runtime.
- **Impacto:** Una vulnerabilidad del servidor o configuración tendría mayor impacto dentro del contenedor; la postura depende de defaults de la imagen.
- **Mitigación:** Ejecutar la aplicación y pruebas con usuarios no-root compatibles, retirar capacidades innecesarias y considerar filesystem de solo lectura. Verificar explícitamente que no se requiere `privileged`.
- **Severidad:** Media-baja.

### F001-SEC-05 — Esquema de `localStorage`

- **Estado:** No aplicado.
- **Evidencia:** `src/app.js:14-19` sólo comprueba que el valor parseado sea un array; no valida tipos, presencia de `id`/`title`/`completed`, longitud por elemento o cantidad total. `src/app.js:34-55` consume esos campos directamente.
- **Impacto:** Datos manipulados en el mismo origen pueden provocar estado inconsistente, degradación de disponibilidad o errores de renderizado. `localStorage` no es frontera de confidencialidad frente a scripts del mismo origen.
- **Mitigación:** Validar/normalizar el esquema al cargar, descartar elementos inválidos, limitar tamaño/cantidad y manejar explícitamente cuota agotada.
- **Severidad:** Baja; integridad/disponibilidad local, sin exposición remota observada.

### F001-SEC-06 — Dependencias y usuario del contenedor de pruebas

- **Estado:** No aplicado.
- **Evidencia:** `tests/Dockerfile:3-4` ejecuta `npm ci` con el usuario por defecto de la imagen y no hay `USER` posterior. `package-lock.json:1` fija versiones, pero no hay evidencia de `npm audit`, SBOM, checksum/provenance del artefacto npm o registry controlado.
- **Impacto:** Un compromiso de dependencia o registry afecta el entorno de pruebas/build; no se observa dependencia npm en la imagen runtime de nginx.
- **Mitigación:** Mantener el lockfile, verificar integridad y vulnerabilidades, generar SBOM y ejecutar pruebas como usuario no-root cuando sea compatible.
- **Severidad:** Baja-media, limitada al contenedor de pruebas/build.

## Superficie Docker revisada

- **Imágenes base:** nginx Alpine y Playwright Noble están versionadas y fijadas por digest.
- **Instalación:** sólo `npm ci` en la imagen de pruebas; no hay instalación de dependencias en la imagen runtime.
- **Secretos:** no hay `secrets`, variables secretas ni credenciales observadas; `.dockerignore` excluye `.env*`, claves y certificados comunes.
- **Puertos:** sólo `8080:80` para `app` (`compose.yaml:4-5`); `tests` no publica puertos.
- **Volúmenes:** no se declaran volúmenes ni montajes de host.
- **Build context:** ambos builds usan la raíz (`compose.yaml:3,12-14`), mitigada por `.dockerignore`, pero aún requiere disciplina sobre archivos sensibles no contemplados.
- **Privilegios:** no se observa `privileged` ni `cap_add`; tampoco existe endurecimiento explícito de usuario/capacidades/read-only.
- **Runtime nginx:** `autoindex off`, rutas estáticas explícitas y healthcheck local (`nginx.conf:10-11`, `Dockerfile:5`).

## Verificación y límites de evidencia

`.framework/runs/R004/events.jsonl` registra `docker compose build`, `up -d app`, `run --rm tests` con **5 passed**, estado healthy y limpieza sin contenedores activos. La suite incluye la prueba de cabeceras (`tests/todo.spec.js:5-13`). No se ejecutó una nueva orden durante esta reauditoría; la conclusión se basa en los artefactos y la traza proporcionados. No hay evidencia en la traza de firma/provenance/SBOM, escaneo de vulnerabilidades ni inspección de privilegios efectivos del contenedor.

## Decisión / escalamiento

No se requiere escalamiento por riesgo crítico observado. **ESCALATE → Orchestrator** sólo si debe decidirse si los riesgos residuales de provenance/SBOM, runtime no-root, esquema de `localStorage` o dependencias de prueba son condición obligatoria para publicación o para S07/S08.

No se aplicaron correcciones en esta revisión ni se contactó al Development Team.
