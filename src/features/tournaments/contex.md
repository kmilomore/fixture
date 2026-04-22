# Contexto del feature tournaments

## Propósito

Este feature modela el agregado principal del negocio: el torneo.

## Estructura

- `application/tournament-service.ts`
  - listado, detalle, alta, edición, baja e inscripción de equipos.
- `domain/tournament-lifecycle.ts`
  - estados del torneo, transiciones válidas y normalización de reglas de calendarización.

## Llamadas relevantes

- `src/app/tournaments/* -> tournament-service`
- `src/app/tournaments/[id]/page.tsx -> getTournamentDetail()`
- `src/lib/tournamentExports.ts -> getTournamentDetail()`
- `src/features/fixture/application/fixture-service.ts` depende del estado y formato del torneo para mutaciones de partidos.

## Hallazgos

- `getTournamentDetail()` ya actúa como agregado canónico del torneo para UI y exportación.
- `tournament-lifecycle` es un contrato compartido muy sensible porque lo usan UI, actions y servicios.

## Cosas que evitar

- No duplicar derivación de estado del torneo en otros módulos.
- No crear otra consulta paralela de detalle para exportación o calendario.

## Ver también

- `src/app/tournaments/contex.md`
- `src/app/tournaments/[id]/contex.md`
- `src/features/fixture/contex.md`