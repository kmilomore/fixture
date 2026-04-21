# Contexto del módulo de configuración

## Ruta

- `/settings`

## Propósito

Presenta información general de la aplicación.

Actualmente cumple un rol informativo, no de configuración editable.

## Archivos clave

- `page.tsx`
  - muestra versión;
  - tipo de base de datos;
  - tipo de motor de fixtures.

## Estado actual

La pantalla no guarda preferencias ni expone formularios.

Es, en la práctica, una vista “Acerca de”.

## APIs y acciones disponibles

- No expone endpoints propios.
- Puede mostrar configuración derivada del entorno o de la documentación operativa, pero no administra datos de negocio.

## Hallazgos

- El título del módulo sugiere settings reales, pero hoy no hay configuración persistente.
- Si se agregan opciones futuras como respaldo, restauración, idioma, reseteo de base o rutas de exportación, este módulo es el punto natural para alojarlas.
