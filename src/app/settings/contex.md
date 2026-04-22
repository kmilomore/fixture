# Contexto del módulo de settings

## Ruta

- `/settings`

## Propósito

Hoy este módulo funciona como superficie informativa, no como panel de configuración operativa.

Su valor es contextual:

- explicar qué stack usa la app;
- dejar visible el tipo de motor y base de datos;
- servir como futuro punto de entrada para configuración real.

## Archivo clave

- `page.tsx`
  - muestra metadatos de la aplicación;
  - no llama a servicios de negocio;
  - no guarda preferencias.

## Relaciones con otros módulos

- `src/app/contex.md`
  - lo clasifica como módulo satélite.
- `DOCUMENTATION.md`
  - contiene el detalle técnico que esta pantalla podría resumir.

## Hallazgos

- El nombre del módulo promete más de lo que hoy entrega.
- Aun así, es el lugar correcto si en el futuro se agregan toggles de sincronización, exportación, idioma o mantenimiento.

## Cosas que evitar

- No meter aquí reglas de negocio de torneos o fixture.
- No presentar como editable algo que todavía no se persiste.
- No duplicar documentación técnica extensa dentro de la UI.

## Ver también

- `src/app/contex.md`
- `DOCUMENTATION.md`
