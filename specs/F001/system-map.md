# SystemMap — F001

**Base inspeccionada:** `git:f9954b8c5adda36a4cfd70fcc30199d0b50d7ebd`  
**Specification:** `specs/F001/specification.md`

## Hechos observados

- El commit contiene únicamente el scaffold de Codex Core-V1; no contiene una aplicación funcional.
- No existen entrypoints de aplicación, frontend ni backend.
- No existen manifiestos de dependencias (`package.json`, `pyproject.toml`, `requirements.txt`, etc.).
- No existen pruebas automatizadas ni configuración de test runner.
- No existen `Dockerfile`, `compose.yaml`, `docker-compose.yml` ni otra configuración Docker.
- No se declaran puertos, volúmenes, healthchecks ni servicios de soporte.
- El único ejecutable Python identificable es `.framework/validate_handoff.py`, herramienta del plano de control, no entrypoint de la aplicación.
- La configuración existente del framework está en `.codex/config.toml`, `.codex/agents/*.toml` y `.framework/contracts.toml`.
- El flujo operativo se documenta en `README.md`, incluyendo `.framework/runs/<run-id>/events.jsonl` como trazabilidad.
- La Specification exige Docker Desktop para build, runtime, pruebas y soporte, y define persistencia mediante `localStorage`; ninguna de esas capacidades está implementada en el commit inspeccionado.

## Mapa propuesto

| Área | Estado actual | Interfaces/dependencias |
|---|---|---|
| Entrypoint aplicación | Ausente | Debe definirse durante la implementación |
| Frontend | Ausente | Debe proporcionar UI en español y persistencia `localStorage` según la Specification |
| Pruebas | Ausentes | Deben cubrir creación, validación, estado, edición, eliminación, filtrado y recarga |
| Docker/runtime | Ausente | Debe añadirse configuración versionada compatible con Docker Desktop |
| Puertos | No declarados | Requiere decisión del TechnicalPlan |
| Volúmenes | No declarados | Probablemente no necesarios para `localStorage`, pendiente de confirmar |
| Healthchecks | No declarados | Requieren definición al introducir el servicio runtime |
| Servicios de soporte | Ausentes | No hay base de datos ni servicios externos aprobados |
| Plano de control | `.framework/validate_handoff.py` y configuración TOML | Python estándar; no forma parte del runtime de F001 |

## Incertidumbres y gaps

1. No puede inferirse la tecnología frontend, servidor estático ni topología de contenedores desde el commit.
2. No puede determinarse un puerto HTTP, comando de build/runtime o estrategia de healthcheck.
3. No hay evidencia para requerir base de datos, volumen persistente o servicio auxiliar; la Specification fija `localStorage`.
4. Para avanzar al TechnicalPlan se requiere diseñar explícitamente la primera estructura de aplicación, pruebas y configuración Docker, manteniéndose dentro del alcance aprobado.
