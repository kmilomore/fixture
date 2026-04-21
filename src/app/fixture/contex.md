# Contexto del módulo de fixture general

## Ruta

- `/fixture`

## Propósito

Actúa como hub de navegación rápida hacia los módulos principales relacionados con la operación deportiva:

- torneos;
- establecimientos;
- equipos;
- disciplinas y categorías.

## Archivos clave

- `page.tsx`
  - no consulta base de datos;
  - presenta tarjetas de acceso rápido a los módulos operativos.

## Flujos de trabajo

### Navegación operativa

1. El usuario entra a `/fixture`.
2. Elige el módulo que necesita operar.
3. La página actúa como menú contextual más que como vista de datos.

## APIs y acciones disponibles

- No expone APIs.
- No ejecuta server actions.

## Hallazgos

- El nombre “Fixture General” sugiere una vista agregada, pero hoy funciona principalmente como landing page de navegación.
- Si más adelante se quiere una vista global real de partidos y estados, este módulo es el lugar natural para implementarla.
