# Specification — F001

## Objetivo

Crear un sitio web MVP en español que permita a un único usuario gestionar su lista personal de tareas desde un navegador.

## Alcance

Incluye:

- Visualizar la lista de tareas.
- Crear una tarea con título obligatorio.
- Marcar y desmarcar tareas como completadas.
- Editar el título de una tarea.
- Eliminar una tarea.
- Diferenciar visualmente tareas pendientes y completadas.
- Mantener las tareas disponibles al recargar el navegador, según la decisión de persistencia aprobada.

Fuera de alcance:

- Registro, autenticación o múltiples usuarios.
- Colaboración o compartir tareas.
- Categorías, etiquetas, fechas límite, prioridades o notificaciones.
- Integraciones externas.
- Aplicación móvil nativa.

## Restricciones

- La interfaz y los mensajes visibles deben estar en español.
- El producto debe funcionar en navegadores web compatibles definidos para el MVP.
- Docker Desktop es obligatorio para todos los entornos de build, runtime, pruebas y servicios de soporte.
- La configuración de Docker deberá estar versionada.
- No se prescribe la topología de contenedores en esta Specification.
- No se permite depender de servicios externos no aprobados para cumplir el alcance.

## Criterios de aceptación

1. El usuario puede abrir el sitio y ver un estado inicial claro, incluso cuando no existen tareas.
2. El usuario puede crear una tarea con un título válido y verla inmediatamente en la lista.
3. No se puede crear una tarea sin título; se muestra una indicación comprensible en español.
4. El usuario puede marcar una tarea como completada y volverla a marcar como pendiente.
5. El usuario puede editar el título de una tarea existente.
6. El usuario puede eliminar una tarea y esta deja de aparecer en la lista.
7. Las tareas pendientes y completadas se distinguen visualmente y de forma comprensible.
8. Tras recargar el navegador, las tareas se conservan mediante `localStorage` en el mismo navegador, perfil y dispositivo.
9. El usuario puede filtrar la lista por todas, pendientes y completadas.
10. Las operaciones principales pueden ejecutarse desde teclado y los controles tienen nombres comprensibles.
11. El build, runtime, pruebas y servicios de soporte se ejecutan mediante Docker Desktop y la configuración versionada correspondiente.
12. Las pruebas automatizadas y/o verificaciones documentadas cubren como mínimo creación, validación de título, cambio de estado, edición, eliminación, filtrado y recarga.

## Dependencias

- Docker Desktop disponible y operativo.
- Navegador web compatible para validación manual.
- Docker Desktop con la configuración versionada del proyecto.
- Navegador compatible: última versión estable de Chrome o Edge en Windows.
- Entorno de ejecución y herramientas de pruebas aprobados posteriormente por los roles responsables.

## Decisiones cerradas

- Persistencia: `localStorage` del navegador.
- Alcance de persistencia: sólo el mismo navegador, perfil y dispositivo.
- Navegadores objetivo: última versión estable de Chrome y Edge en Windows.
- Filtrado: incluir vistas de todas, pendientes y completadas.
- Títulos duplicados: permitidos.
- Longitud del título: entre 1 y 120 caracteres después de recortar espacios.
- Error de almacenamiento: mostrar un aviso en español y conservar los cambios sólo en memoria durante la sesión.

## Task List

<a id="task-list"></a>

- [x] Confirmar las decisiones de persistencia, navegadores, filtrado, duplicados, longitud máxima y error de almacenamiento.
- [x] Definir y documentar la Specification aprobada y sus criterios verificables.
- [x] Preparar la planificación técnica sin ampliar el alcance aprobado.
- [x] Implementar las capacidades de listar, crear, validar, editar, completar/descompletar y eliminar tareas.
- [x] Implementar el comportamiento de persistencia aprobado.
- [x] Proporcionar configuración versionada para ejecutar build, runtime, pruebas y servicios de soporte mediante Docker Desktop.
- [x] Verificar los criterios de aceptación funcionales, de accesibilidad básica y de recarga.
- [x] Registrar evidencias de pruebas y cualquier desviación respecto de esta Specification.
