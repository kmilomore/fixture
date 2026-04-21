# Contexto del módulo de equipos

## Ruta

- `/teams`

## Propósito

Administra los equipos disponibles para torneos.

En el estado actual del sistema, cada establecimiento genera automáticamente un equipo base homónimo.
El módulo también permite crear equipos adicionales manualmente.

## Archivos clave

- `page.tsx`
  - Lista equipos con su establecimiento asociado.
  - Obtiene establecimientos para el formulario de alta.

- `Components.tsx`
  - `NewTeamForm`
  - `DeleteTeamButton`

- `../actions/teams.ts`
  - Alta y eliminación.

## Flujos de trabajo

### Equipo automático por establecimiento

1. Se crea o sincroniza un establecimiento.
2. `ensureTeamsMatchEstablishments()` revisa si existe un equipo con el mismo nombre para ese establecimiento.
3. Si no existe, lo crea.

### Alta manual de equipo

1. El usuario abre el formulario.
2. Indica nombre del equipo y establecimiento.
3. Se crea el registro y se revalidan `/teams` y `/establishments`.

## APIs y acciones disponibles

API HTTP:

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/:id`
- `PATCH /api/teams/:id`
- `DELETE /api/teams/:id`

Acciones server heredadas:

- `createTeam(formData)`
- `deleteTeam(id)`

## Dependencias

- `establishments`
  - define el origen institucional de cada equipo.
- `tournaments`
  - consume equipos para inscripción.

## Hallazgos

- El módulo dejó de ser un CRUD independiente: ahora refleja una política de sincronización con establecimientos.
- No hay deduplicación fuerte para equipos manuales fuera del vínculo por establecimiento, por lo que el usuario todavía puede crear variantes adicionales si quiere.
- Si más adelante se requiere separar “equipo base” de “equipo adicional”, conviene agregar un campo booleano o tipo.
- Para frontend externo o integraciones, la vía recomendada ahora es la API HTTP y no consultas directas desde el módulo.
