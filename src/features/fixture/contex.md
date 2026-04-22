# Contexto del feature fixture

## Propósito

Este feature resuelve la lógica deportiva y operativa del torneo una vez que ya existe el agregado principal.

## Estructura

- `application/fixture-service.ts`
  - guarda formato;
  - genera fixture;
  - reinicia fixture;
  - actualiza resultados;
  - recalcula progresión automática.

- `domain/fixture-engine.ts`
  - genera partidos según formato;
  - asigna slots de calendario;
  - admite grupos y cabezas de serie.

- `domain/match-lifecycle.ts`
  - estados de partido, incidencias y helpers de presentación.

- `domain/standings.ts`
  - tabla de posiciones, clasificación y agrupación por etapa.

- `domain/progression.ts`
  - traduce placeholders como `1A`, `Mejor 2°` o `Ganador Semifinal 1` en asignaciones reales.

- `presentation/*`
  - componentes especializados del detalle del torneo: configurador, tablas, grupos y edición de partidos.

## Llamadas relevantes

- `src/app/tournaments/[id]/FixtureEngine.tsx -> fixture-service`
- `src/app/actions/fixture.ts -> fixture-service`
- `src/app/api/matches/[id]/route.ts -> updateMatchResult()`
- `src/app/api/tournaments/[id]/fixture/* -> fixture-service`

## Hallazgos

- Este feature concentra la mayor densidad de reglas puras del sistema.
- La progresión automática después de registrar resultados es tan importante como la generación inicial.
- `standings` y `progression` deben seguir siendo dominio puro para poder probarlos sin framework.

## Cosas que evitar

- No mover reglas de clasificación o progresión a componentes cliente.
- No hacer que exportación o calendario reimplementen lectura del fixture.
- No mezclar estado de partido y estado de torneo sin pasar por servicios y lifecycles compartidos.

## Ver también

- `src/app/tournaments/[id]/contex.md`
- `src/features/tournaments/contex.md`