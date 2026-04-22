# Contexto del feature teams

## Propósito

Expone el directorio de equipos que puede terminar inscrito en torneos.

## Estructura

- `application/team-service.ts`
  - listado, detalle, alta, edición y baja.

## Llamadas relevantes

- `src/app/teams/* -> team-service`
- `src/app/tournaments/* -> listTeams()`
- `src/lib/establishments.ts` puede disparar la creación de equipos base que luego este feature expone.

## Hallazgos

- Aunque no tenga capa `domain`, ya tiene una semántica propia: representa equipos disponibles, no participantes de torneo.
- Su frontera con `tournaments` debe mantenerse clara.

## Cosas que evitar

- No meter aquí reglas de inscripción al torneo.
- No romper la dependencia con establecimiento al editar o crear equipos.

## Ver también

- `src/app/teams/contex.md`
- `src/features/tournaments/contex.md`