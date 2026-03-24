# Commit Message Recomendado

Puedes usar el siguiente mensaje para tu commit con todos los cambios que hicimos hoy en el módulo de atletas:

```text
feat(atletas): historial, edición y corrección integral de gestión de representantes y validaciones

- **Atletas (Backend):** `deleteAtleta` ahora realiza un borrado en cascada real (asistencias, ficha médica, medidas, pruebas, representante huérfano, y atleta). Múltiples correciones de Foreign Key Constraints.
- **Representantes:** Nuevo endpoint (`DELETE /api/atletas/:id/tutor`) para transición segura a auto-representación y borrado de registros huérfanos sin errores 400 por cédula duplicada.
- **Representantes (UI):** Corregida visibilidad de la pestaña validando igualdad de cédula/nombre. Mapeo correcto de tipos de relación según enum de BD.
- **Validaciones (UI):** Dirección obligatoria para menores, asteriscos fijos en campos requeridos y prevención de errores `Cannot read properties of undefined` al usar los modales de edición independientes.
- **Medidas y Rendimiento:** Transformación de las pestañas a Data Tables interactivas para visualizar múltiples registros históricos.
- **Medidas y Rendimiento (Edición):** Modificación de la base de datos (`fecha_medicion` a `DATETIME`) para registrar la hora exacta. Implementación completa de CRUD: endpoints `POST`, `PUT`, y `DELETE`, e integración de seleccionadores de fecha/hora (`datetime`) en los modales iterativos.
```
