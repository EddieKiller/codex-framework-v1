# Specification — F002: Tareas con repetición diaria

## Objetivo

Extender el MVP de gestión de tareas de F001 para permitir configurar una tarea como recurrente diariamente. Una tarea recurrente representa una única actividad por día calendario: al completarla queda completada para el día actual y al comenzar otro día vuelve a aparecer como pendiente, sin crear una nueva tarea.

## Alcance

- Crear tareas recurrentes diarias y conservar tareas no recurrentes sin cambios.
- Identificar las tareas recurrentes con un indicador textual accesible en español.
- Completar y desmarcar una tarea recurrente respecto del día actual.
- Hacer que al cambiar de día la misma tarea aparezca pendiente, sin duplicarla.
- Persistir configuración y estado diario mediante la persistencia local existente.
- Mantener filtros, edición, eliminación, recarga y compatibilidad con datos de F001.

Fuera de alcance: recurrencias semanales/mensuales o por días seleccionados, múltiples ejecuciones diarias, historial visible, notificaciones, fechas de inicio/fin, cuentas, backend o sincronización externa.

## Reglas funcionales

1. Una tarea puede ser recurrente o no recurrente.
2. Las tareas no recurrentes conservan exactamente el comportamiento aprobado en F001.
3. Una recurrente está pendiente si no se completó durante el día calendario actual y completada si sí se completó.
4. Cambiar de día reinicia visualmente la recurrente a pendiente sin duplicarla.
5. Desmarcar durante el día actual vuelve a dejarla pendiente.
6. Editar o eliminar conserva las reglas generales de F001.
7. Los filtros Todas, Pendientes y Completadas reflejan el estado del día actual.
8. Las tareas existentes de F001 se tratan como no recurrentes salvo configuración explícita.
9. Los controles nuevos son accesibles mediante teclado y están en español.

## Restricciones

- Build, runtime, pruebas y servicios de soporte deben ejecutarse mediante Docker Desktop con configuración versionada.
- No instalar dependencias ni ejecutar comandos de aplicación directamente en el host.
- Mantener localStorage y no introducir servicios externos.
- El día calendario será el día local del navegador/dispositivo; el mecanismo de prueba deberá permitir simularlo de forma determinista.

## Criterios de aceptación

1. Crear una tarea no recurrente mantiene F001.
2. Crear una tarea “recurrente diariamente” la identifica y la muestra pendiente.
3. Completarla la muestra completada durante el día actual; desmarcarla la devuelve a pendiente.
4. Tras recarga el mismo día conserva el estado; en un día posterior vuelve a pendiente.
5. El cambio de día no crea filas duplicadas.
6. Filtros, edición y eliminación funcionan correctamente para recurrentes.
7. Datos existentes de F001 siguen visibles y operativos como no recurrentes.
8. Configuración y estado necesario sobreviven a recarga.
9. Controles y mensajes nuevos son accesibles y están en español.
10. Pruebas cubren creación, persistencia, completado, desmarcado, cambio de día, filtros, edición, eliminación, compatibilidad y Docker.

## Decisiones propuestas para S01

- Día calendario: zona horaria local del navegador/dispositivo.
- Tareas existentes: permanecen no recurrentes, pero se permite convertirlas durante edición.
- Edición: permitir activar/desactivar recurrencia; al cambiar la configuración se reinicia el estado diario de forma explícita y verificable.
- Indicador: etiqueta textual accesible “Recurrente diariamente”.
- Cambio de día: reloj inyectable o mecanismo equivalente de prueba, definido en TechnicalPlan.

## Task List

<a id="task-list"></a>

- [ ] Aprobar en S01 las decisiones de zona horaria, conversión, edición, indicador y prueba de cambio de día.
- [ ] Confirmar compatibilidad con capacidades y datos persistidos de F001.
- [ ] Preparar TechnicalPlan sin ampliar el alcance.
- [ ] Implementar configuración en creación y edición.
- [ ] Implementar completitud por día calendario y cambio de día sin duplicación.
- [ ] Mantener comportamiento no recurrente, localStorage, filtros, recarga y estados vacíos.
- [ ] Añadir identificación accesible en español.
- [ ] Añadir pruebas automatizadas de todos los criterios, ejecutadas en Docker.
- [ ] Registrar evidencia observable y desviaciones.
- [ ] Realizar revisión de seguridad sobre persistencia, validación y Docker.
