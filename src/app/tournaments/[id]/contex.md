# Contexto del submódulo de detalle de torneo

## Ruta

- `/tournaments/[id]`

## Propósito

Concentra la operación completa de un torneo individual desde una sola vista de trabajo.

El submódulo ya no se limita a crear el fixture. También administra:

- ciclo de vida del torneo;
- persistencia de reglas de calendarización;
- inscripción y cierre de participantes;
- operación diaria de partidos;
- incidencias deportivas y administrativas;
- exportación operativa del fixture.

## Pestañas actuales

- `Resumen`
  - muestra métricas rápidas del torneo;
  - muestra el siguiente paso operativo sugerido;
  - expone control manual del estado del torneo con transiciones válidas.

- `Equipos`
  - permite inscribir o quitar equipos solo mientras no exista fixture generado.

- `Fixture`
  - permite elegir formato y reglas calendario antes de generar;
  - muestra la estructura deportiva agrupada por grupo, fecha interna o ronda;
  - permite editar estado, marcador, fecha, lugar e incidencias de cada partido.

- `Calendario`
  - reordena los partidos por día real de juego;
  - permite filtrar por estado, sede y día;
  - sirve como tablero operativo separado del agrupamiento deportivo.

## Archivos clave

- `page.tsx`
  - consulta torneo, equipos y partidos;
  - serializa datos para componentes cliente;
  - resuelve pestañas y badges del estado del torneo.

- `ClientComponents.tsx`
  - contiene gestión de equipos;
  - contiene control manual de estado del torneo.

- `FixtureEngine.tsx`
  - configura formato y reglas de calendario;
  - genera el fixture;
  - renderiza los partidos agrupados en lógica deportiva;
  - permite edición inline de estado, marcador, lugar, fecha e incidencias;
  - expone exportaciones y reinicio del fixture.

- `CalendarView.tsx`
  - construye una vista operativa por fecha real;
  - filtra por `status`, `location` y `day`.

- `../../../api/tournaments/[id]/route.ts`
  - devuelve el agregado completo del torneo;
  - deriva el estado visible del torneo;
  - persiste reglas de calendario.

- `../../../api/tournaments/[id]/fixture/format/route.ts`
  - guarda el formato y la configuración calendario del torneo.

- `../../../api/tournaments/[id]/fixture/generate/route.ts`
  - genera los partidos y deja el torneo en estado `SCHEDULED`.

- `../../../api/tournaments/[id]/fixture/reset/route.ts`
  - elimina partidos y vuelve el torneo a `DRAFT`.

- `../../../api/tournaments/[id]/teams/route.ts`
  - permite inscribir equipos solo antes del fixture.

- `../../../api/tournaments/[id]/teams/[teamEntryId]/route.ts`
  - permite quitar equipos solo antes del fixture.

- `../../../api/matches/[id]/route.ts`
  - actualiza estado del partido, marcador, lugar, fecha, incidencia y notas;
  - recalcula el estado agregado del torneo a partir de los partidos.

- `../../../lib/tournamentLifecycle.ts`
  - define estados del torneo, transiciones permitidas y presentación visible.

- `../../../lib/matchLifecycle.ts`
  - define estados del partido, tipos de incidencia y su presentación.

- `../../../lib/tournamentExports.ts`
  - centraliza los datos exportables del torneo;
  - evita duplicar lógica entre PDF y Excel.

## Estados del torneo

- `DRAFT`
  - torneo sin condiciones mínimas para generar fixture.

- `READY`
  - ya tiene formato y al menos dos equipos;
  - todavía no tiene partidos generados.

- `SCHEDULED`
  - el fixture existe y no hay partidos cerrados todavía.

- `PLAYING`
  - existe fixture y al menos un partido ya quedó cerrado.

- `PAUSED`
  - estado manual para detener la operación sin borrar el fixture.

- `FINISHED`
  - todos los partidos del torneo están cerrados.

- `CANCELLED`
  - estado manual de cancelación del torneo.

## Transiciones válidas del torneo

- `DRAFT -> READY | CANCELLED`
- `READY -> DRAFT | SCHEDULED | CANCELLED`
- `SCHEDULED -> READY | PLAYING | PAUSED | CANCELLED`
- `PLAYING -> PAUSED | FINISHED | CANCELLED`
- `PAUSED -> SCHEDULED | PLAYING | CANCELLED`
- `FINISHED -> SCHEDULED`
- `CANCELLED -> DRAFT`

## Estados del partido

- `SCHEDULED`
  - partido programado, sin marcador.

- `LIVE`
  - partido en juego, sin cierre definitivo.

- `FINISHED`
  - partido finalizado con marcador obligatorio.

- `WALKOVER`
  - partido resuelto administrativamente con marcador obligatorio.

- `SUSPENDED`
  - partido suspendido, sin marcador válido.

- `CANCELLED`
  - partido cancelado, sin marcador válido.

## Tipos de incidencia del partido

- `NO_PRESENTACION`
- `SUSPENSION`
- `PROTESTA`
- `ABANDONO`
- `REPROGRAMACION`

## Reglas de negocio vigentes

### Equipos y fixture

1. Un torneo necesita al menos dos equipos para poder quedar `READY` o generar fixture.
2. No se pueden agregar ni quitar equipos una vez que existe al menos un partido generado.
3. El reinicio del fixture borra partidos y devuelve el torneo a `DRAFT`.

### Formato y calendarización

1. La configuración calendario se persiste en el torneo.
2. Si el calendario no tiene suficientes slots válidos, la generación falla con error explícito.
3. `GRUPOS_ELIMINATORIA` permite `2`, `3` o potencias de `2` en cantidad de grupos.

### Estados del partido

1. El marcador solo puede guardarse cuando el partido está en `FINISHED` o `WALKOVER`.
2. Si un partido no está en `FINISHED` o `WALKOVER`, el marcador se limpia y no se acepta en API.
3. Una incidencia requiere siempre una nota descriptiva.
4. No se pueden guardar notas de incidencia si no existe un tipo de incidencia.
5. El estado visible del torneo depende del agregado de estados de sus partidos, no solo de un valor manual persistido.

### Exportaciones

1. PDF y Excel salen de una estructura común centralizada.
2. Las exportaciones ya incluyen estado del partido e incidencias.
3. PDF prioriza lectura e impresión.
4. Excel prioriza administración y revisión posterior.

## Flujos de trabajo

### Antes del fixture

1. El torneo entra en `DRAFT`.
2. Se define formato.
3. Se inscriben equipos.
4. Si hay formato y al menos dos equipos, el torneo queda `READY`.
5. Se definen reglas de calendarización.
6. Se genera el fixture.
7. El torneo pasa a `SCHEDULED`.

### Operación del fixture

1. La pestaña `Fixture` muestra el agrupamiento deportivo.
2. Cada partido se puede editar inline.
3. El usuario puede cambiar estado, lugar, fecha, incidencia y notas.
4. Solo `FINISHED` y `WALKOVER` aceptan marcador.
5. Cuando aparecen partidos cerrados, el torneo pasa a `PLAYING`.
6. Cuando todos los partidos están cerrados, el torneo pasa a `FINISHED`.

### Operación calendario

1. La pestaña `Calendario` ordena partidos por fecha real.
2. El usuario puede filtrar por estado del partido.
3. El usuario puede filtrar por sede o lugar.
4. El usuario puede filtrar por día específico o partidos sin fecha.

### Exportación

1. El torneo ya tiene partidos generados.
2. El usuario exporta desde `Fixture`.
3. PDF y Excel incluyen grupo o ronda, estado, incidencia, fecha, lugar y notas si existen.

## Qué debe hacer esta sección

- Resolver la operación de un torneo sin salir de su detalle.
- Mantener separada la lógica deportiva del orden operativo por calendario.
- Exponer reglas de negocio claras para equipos, partidos y estados.
- Mantener exportaciones consistentes con lo que ve el usuario.

## Qué se debe evitar

- No permitir edición de equipos una vez generado el fixture.
- No aceptar marcador en estados que no representan cierre válido del partido.
- No permitir incidencias sin trazabilidad mínima mediante nota.
- No duplicar la lógica exportable entre formatos.
- No mezclar el agrupamiento deportivo con el tablero operativo calendario.

## Hallazgos

- El módulo dejó de ser solo un generador de fixture y ahora actúa como centro operativo del torneo.
- La consistencia del sistema depende cada vez más de contratos compartidos como `tournamentLifecycle` y `matchLifecycle`.
- El mayor riesgo funcional no está en la generación del fixture sino en la consistencia entre estado de partido, estado del torneo y exportaciones.
- La pestaña `Calendario` es la superficie más cercana a una mesa de control real.
