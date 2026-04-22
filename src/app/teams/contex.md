# Contexto del módulo de equipos

## Ruta

- `/teams`

## Propósito

Este módulo administra el inventario de equipos inscribibles en torneos.

Su particularidad es que no parte de cero: convive con una política automática donde cada establecimiento puede originar un equipo base homónimo.

## Responsabilidades

- listar equipos con su establecimiento;
- crear equipos manuales adicionales;
- eliminar equipos no requeridos;
- exponer el conjunto disponible para `tournaments`.

## Archivos y llamadas relevantes

- `page.tsx`
  - consulta equipos y establecimientos disponibles.

- `Components.tsx`
  - alta y baja de equipos.

- `../actions/teams.ts`
  - llama a `src/features/teams/application/team-service.ts`.

- `src/features/teams/application/team-service.ts`
  - listado, detalle, alta, edición y baja.

- `src/lib/establishments.ts`
  - sincroniza equipos base desde establecimientos.

## Flujos principales

### Equipo base por establecimiento

1. Se crea o sincroniza un establecimiento.
2. La rutina de sincronización revisa si ya existe el equipo base.
3. Si no existe, lo crea.

### Alta manual de equipo

1. El usuario envía nombre y establecimiento.
2. La action delega al servicio.
3. El servicio inserta el equipo.
4. Se revalidan vistas que lo consumen.

### Consumo desde torneos

1. `/tournaments` y `/tournaments/[id]` cargan el directorio de equipos.
2. La UI filtra los ya inscritos para no duplicarlos.
3. `addTeamToTournament()` usa el `teamId` elegido.

## Relaciones con otros módulos

- `establishments`
  - define la procedencia institucional y puede crear equipos base.
- `tournaments`
  - consume este módulo para inscripción.
- `tournaments/[id]`
  - es el punto donde estos equipos se convierten en participantes reales del torneo.

## Hallazgos

- El módulo ya no es un CRUD puro; expresa una política de sincronización derivada de establecimientos.
- La separación entre equipo base y equipo adicional todavía es conceptual, no estructural.
- Este módulo afecta directamente la experiencia del selector de inscripción en torneos.

## Cosas que evitar

- No romper la relación `team -> establishment` con formularios parciales.
- No suponer que todos los equipos son manuales.
- No agregar lógica de inscripción aquí; eso pertenece a `tournaments/[id]`.

## Ver también

- `src/app/establishments/contex.md`
- `src/app/tournaments/contex.md`
- `src/app/tournaments/[id]/contex.md`
