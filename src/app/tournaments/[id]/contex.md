# Contexto del submódulo de detalle de torneo

## Ruta

- `/tournaments/[id]`

## Propósito

Este es el centro operativo del sistema.

Aquí convergen:

- inscripción final de participantes;
- definición de formato y seeds;
- generación del fixture;
- vista explícita de fase grupal y tabla de posiciones;
- progresión automática de cruces;
- carga de resultados e incidencias;
- vista calendario minimalista con detalle por evento;
- exportación PDF y Excel.

## Pestañas y su rol real

- `Resumen`
  - síntesis del torneo y control de estado.
- `Equipos`
  - inscripción solo antes del fixture.
- `Fixture`
  - lógica deportiva: grupos, standings, cruces, filtros por fase y edición de partidos.
- `Calendario`
  - lógica operativa: agenda visual resumida por día real, hora, lugar y filtros.
  - permite abrir el detalle de cada evento al hacer click.

## Archivos y llamadas relevantes

- `page.tsx`
  - llama a `getTournamentDetail()` y serializa el agregado.

- `ClientComponents.tsx`
  - maneja inscripción de equipos y control de estado del torneo.

- `FixtureEngine.tsx`
  - controla formato, grupos, seeds, calendario y generación.
  - expone la superficie que separa vista grupal, eliminatoria y total.

- `CalendarView.tsx`
  - pinta una agenda visual minimalista agrupada por día.
  - separa partidos programados y partidos sin fecha.
  - abre un panel modal con detalle del evento al hacer click.
  - evita formateos de fecha dependientes del entorno durante el render.

- `src/features/fixture/presentation/MatchRow.tsx`
  - resincroniza estado local desde el partido persistido.
  - fuerza refresh de ruta luego de guardar para reflejar cambios de estado.
  - evita formateo no determinista de fecha en render.
  - declara `type="button"` en acciones locales para evitar submits HTML implícitos.

- `src/features/fixture/presentation/FixtureConfigurator.tsx`
  - declara `type="button"` en acciones de formato y generación para no disparar submits implícitos.

- `src/features/fixture/presentation/GeneratedFixtureView.tsx`
  - declara `type="button"` en acciones auxiliares como reset para aislar la interacción de la UI.

- `src/features/fixture/presentation/*`
  - presentación deportiva del fixture.

- `src/features/fixture/domain/fixture-engine.ts`
  - genera partidos por formato.

- `src/features/fixture/domain/standings.ts`
  - calcula puntos, puestos y clasificados.

- `src/features/fixture/domain/progression.ts`
  - resuelve clasificados y arrastra ganadores hacia cruces siguientes.
  - usa un orden estable de cruces priorizando fecha programada y luego `createdAt`.

- `src/features/fixture/application/fixture-service.ts`
  - persiste formato, generación, reset y actualización de partidos.

- `src/features/fixture/domain/match-lifecycle.ts`
  - normaliza el estado visible del partido cuando el dato persistido viene ausente o inválido.

- `src/features/tournaments/application/tournament-service.ts`
  - reconstruye el agregado del torneo y sanea `match.status` a partir de `isFinished` cuando hace falta.

- `src/lib/tournamentExports.ts`
  - toma el agregado del torneo y lo transforma en estructura exportable común para PDF y Excel.

## Flujos principales

### Antes de generar

1. El torneo llega desde `/tournaments`.
2. Se inscriben equipos.
3. Se elige formato.
4. Si hay grupos, se define cantidad de grupos.
5. Si se desea, se seleccionan cabezas de serie por grupo.
6. Se configuran reglas de calendarización.
7. Se genera el fixture.

### Fase grupal

1. Los partidos de grupo alimentan `standings`.
2. La vista `Fixture` permite aislar explícitamente la fase grupal.
3. La tabla muestra puntos, diferencia, puesto y marcas de clasificación.
4. Se marcan clasificados según regla actual.
5. En `GRUPOS_ELIMINATORIA` con 3 grupos clasifican los tres primeros y el mejor segundo.

### Fase eliminatoria

1. `progression` interpreta placeholders como `1A`, `2B`, `Mejor 2°` o `Ganador Semifinal 1`.
2. Cuando un grupo queda resuelto o una llave tiene ganador, se recalculan asignaciones automáticas.
3. El orden de referencias como `Ganador Semifinal 1` y `Ganador Semifinal 2` se estabiliza por fecha programada y no por orden incidental de ids.
4. Los cruces futuros se completan sin intervención manual si todavía no están cerrados.

### Carga de resultados

1. `MatchRow` envía estado, marcador, fecha, lugar e incidencias.
2. `fixture-service` valida el estado del partido.
3. Solo `FINISHED` y `WALKOVER` aceptan marcador.
4. Si hay incidencia, la nota es obligatoria.
5. Los controles del fixture deben ser botones explícitos y no submits implícitos.
6. Si un botón no declara `type="button"`, el navegador puede intentar `POST` contra `/tournaments/[id]?tab=fixture` en vez de ejecutar solo la acción cliente.
7. Luego de guardar, la vista fuerza refresh para evitar que el estado quede viejo en cliente.
8. Al reconstruir el detalle, si `status` viene vacío o inválido pero `isFinished` ya es `true`, el agregado expone el partido como `FINISHED`.
9. Si el resultado afecta la clasificación grupal o define un ganador, se recalcula la progresión automática.
10. Luego se recalcula el estado agregado del torneo.

### Vista calendario

1. `CalendarView` agrupa los partidos por día usando claves de fecha estables.
2. Permite filtrar por estado, lugar y día.
3. Cada tarjeta resume fase, hora, participantes, estado y sede.
4. Al hacer click se abre un detalle del evento con marcador, incidencias y notas.
5. Los partidos sin fecha quedan fuera del bloque principal en una agrupación separada.
6. Se usa para operación de sedes y reprogramaciones, no para leer la lógica deportiva.

### Exportación

1. La UI dispara PDF o Excel.
2. Ambas rutas consumen la misma estructura exportable.
3. La exportación refleja el mismo agregado visible del torneo.

## Relaciones con otros módulos

- `tournaments`
  - es la puerta de entrada a este submódulo.
- `teams`
  - aporta los participantes inscribibles.
- `disciplines`
  - aporta el contexto deportivo del torneo.
- `establishments`
  - aporta la capa institucional visible en equipos y calendario.

## Hallazgos

- Este es el módulo más sensible del sistema porque mezcla estado, dominio deportivo y operación diaria.
- La mayor fuente de errores no suele ser la generación inicial sino la progresión posterior al registrar resultados.
- La separación entre `Fixture` y `Calendario` es correcta: uno responde a lógica deportiva y el otro a operación real.
- En componentes cliente hidratados desde SSR, el formateo de fecha con locale o timezone implícitos puede romper la hidratación y disparar errores React difíciles de rastrear.
- En producción, un botón sin `type="button"` dentro del árbol del detalle puede degradar en un submit HTML y terminar pegándole por `POST` a la ruta de página del torneo.
- Ese síntoma se ve como "no cambia nada" en la UI aunque el problema real sea de navegación o request equivocada.
- También puede haber desalineación entre `isFinished` y `status` en datos persistidos o legados; en ese caso la UI puede mostrar marcador finalizado con badge de programado si no se normaliza el agregado.
- PDF y Excel deben depender del mismo agregado del torneo o divergen muy rápido.
- La legibilidad operativa mejora cuando la fase grupal y la eliminatoria se pueden leer como superficies distintas.
- La automatización de llaves depende de que el orden de cruces sea estable; no puede quedar atado a ids o inserciones accidentales.

## Cosas que evitar

- No permitir edición de equipos después de generar partidos.
- No aceptar marcador en estados no terminales.
- No duplicar la lógica de clasificación en componentes cliente.
- No resolver exportaciones con consultas alternativas a la del detalle.
- No mezclar el orden deportivo con el orden calendario.
- No renderizar fechas con `toLocaleString()` o equivalentes si la salida puede diferir entre servidor y navegador.
- No dejar botones interactivos sin `type="button"` dentro del flujo de fixture.
- No asumir que `status` persistido siempre es confiable si `isFinished` indica otra cosa.
- No depender del orden incidental de creación de partidos para numerar semifinales, cuartos o finales.

## Ver también

- `src/app/contex.md`
- `src/app/tournaments/contex.md`
- `DOCUMENTATION.md`
