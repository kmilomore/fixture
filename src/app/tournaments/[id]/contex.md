# Contexto del submódulo de detalle de torneo

## Ruta

- `/tournaments/[id]`

## Propósito

Expone la operación detallada de un torneo individual.

Incluye:

- resumen del torneo;
- listado de equipos inscritos;
- inscripción o retiro de equipos antes del fixture;
- configuración del formato;
- definición automática de reglas de calendario;
- configuración de cantidad de grupos;
- visualización de partidos;
- edición inline de resultados, fecha y lugar;
- exportación del fixture a PDF y Excel.

## Archivos clave

- `page.tsx`
  - consulta el torneo completo con disciplina, categoría, equipos y partidos.
  - serializa fechas para el componente cliente.

- `ClientComponents.tsx`
  - formulario para agregar equipos al torneo.
  - botón para quitar equipos del torneo.

- `FixtureEngine.tsx`
  - selecciona formato.
  - permite elegir entre `LIGA`, `ELIMINATORIA` y `GRUPOS_ELIMINATORIA`.
  - permite definir cantidad de grupos.
  - permite definir cuántos partidos se juegan por fecha.
  - permite definir días, rango de fechas, tramo horario y duración de partidos.
  - genera partidos.
  - agrupa visualmente por grupo cuando existe fase grupal y muestra la fecha interna dentro de cada grupo.
  - permite edición inline de cada partido.
  - expone acciones de exportación a PDF y Excel cuando el fixture ya existe.

- `../../../api/tournaments/[id]/export/pdf/route.ts`
  - genera un PDF legible del fixture actual.

- `../../../api/tournaments/[id]/export/excel/route.ts`
  - genera un Excel con grupos, partidos, fecha, marcador y lugar.

- `../../../api/tournaments/[id]/teams/route.ts`
  - `GET` participantes actuales.
  - `POST` inscripción de equipo al torneo.

- `../../../api/tournaments/[id]/teams/[teamEntryId]/route.ts`
  - `DELETE` retiro de un equipo inscrito.

- `../../../api/tournaments/[id]/fixture/format/route.ts`
  - `PUT` guarda el formato elegido.

- `../../../api/tournaments/[id]/fixture/generate/route.ts`
  - `POST` genera los partidos con reglas de calendario.

- `../../../api/tournaments/[id]/fixture/reset/route.ts`
  - `POST` elimina partidos y vuelve el torneo a `DRAFT`.

- `../../../api/matches/[id]/route.ts`
  - `PATCH` actualiza marcador, fecha, lugar y estado de un partido.

- `../../../lib/tournamentExports.ts`
  - normaliza y centraliza los datos exportables del torneo.

## Flujos de trabajo

### Antes del fixture

1. El torneo está en `DRAFT`.
2. Se pueden agregar y quitar equipos.
3. Se puede elegir `LIGA`, `ELIMINATORIA` o `GRUPOS_ELIMINATORIA`.
4. Se define cuántos grupos se usarán cuando el formato tenga fase grupal.
5. Se define cuántos partidos se permiten por fecha.
6. Se define el rango de fechas, días habilitados, hora inicial, hora final y duración por partido.
7. El sistema calcula automáticamente cuántos días reales necesita.
8. El sistema genera automáticamente los partidos y les asigna fechas/horarios sin repetir slots.

### Después del fixture

1. El estado pasa a `PLAYING`.
2. Se oculta el panel de gestión de inscripciones.
3. Se muestran participantes y grupos/rondas.
4. Se editan resultados con formulario inline.
5. Quedan habilitadas las exportaciones a PDF y Excel.

### Formatos disponibles

- `LIGA`
  - Si `groupCount = 1`, todos contra todos general.
  - Si `groupCount > 1`, los equipos se distribuyen en grupos y cada grupo juega su propio todos contra todos.

- `ELIMINATORIA`
  - Llaves directas con byes si hace falta completar potencia de 2.

- `GRUPOS_ELIMINATORIA`
  - Los equipos se reparten en grupos.
  - Cada grupo juega todos contra todos.
  - Si hay 2, 4, 8, etc., clasifican los dos primeros de cada grupo.
  - Si hay 3 grupos, clasifican los primeros de cada grupo y el mejor 2°.
  - Luego se arma una llave eliminatoria con cruces tipo mundial.
  - Este formato admite 3 grupos como caso especial de semifinal a 4 clasificados.

### Reglas automáticas de calendario

La sección permite fijar:

- fecha inicial;
- fecha final;
- partidos por fecha;
- días de la semana habilitados;
- hora inicial de juego;
- hora final de juego;
- duración de cada partido.

Con eso, el sistema:

- construye slots horarios válidos dentro del rango;
- calcula cuántos días necesita a partir de la cantidad total de partidos y los partidos por fecha;
- asigna partidos uno por uno sin repetir fecha/hora;
- falla con error claro si no alcanza el calendario disponible para todos los partidos.

### Exportación del fixture

1. El torneo ya tiene partidos generados.
2. El usuario usa `Exportar PDF` o `Exportar Excel` desde el bloque del fixture.
3. Las rutas API consultan el torneo actual y agrupan los partidos igual que la UI.
4. El PDF genera una versión visual resumida y legible para impresión o envío.
5. El Excel genera una planilla estructurada para edición, revisión o distribución administrativa.

## Endpoints operativos del submódulo

- `GET /api/tournaments/:id`
- `GET /api/tournaments/:id/teams`
- `POST /api/tournaments/:id/teams`
- `DELETE /api/tournaments/:id/teams/:teamEntryId`
- `PUT /api/tournaments/:id/fixture/format`
- `POST /api/tournaments/:id/fixture/generate`
- `POST /api/tournaments/:id/fixture/reset`
- `PATCH /api/matches/:id`
- `GET /api/tournaments/:id/export/pdf`
- `GET /api/tournaments/:id/export/excel`

### Qué debe hacer esta sección

- Permitir gestionar el torneo completo sin salir de la vista detalle.
- Mantener separada la fase de inscripción del momento en que el fixture ya fue generado.
- Entregar exportaciones comprensibles y listas para compartir.
- Permitir que la generación del fixture sea operativa y no solo estructural, dejando calendario asignado automáticamente.
- Evitar choques de fechas y horarios entre partidos del mismo torneo.

### Qué se debe evitar

- No permitir cambios de equipos inscritos una vez generado el fixture desde esta misma UI.
- No exportar datos vacíos o incompletos simulando que el torneo ya está listo.
- No duplicar lógica de agrupación entre UI y exportación; debe centralizarse.
- No permitir un calendario imposible, por ejemplo con menos slots que partidos.
- No usar grupos arbitrarios en `GRUPOS_ELIMINATORIA`; deben poder cerrar una llave final coherente.

### Reinicio de fixture

1. Se borran todos los partidos del torneo.
2. El torneo vuelve a `DRAFT`.
3. Se limpia el formato.

## Hallazgos

- El agrupamiento de partidos es flexible y depende de `groupName`, `matchLogicIdentifier` o `round`.
- La edición de resultados actual no tiene validación avanzada de puntaje.
- El motor cliente depende de varias server actions, pero no tiene una capa de feedback de error rica más allá de mensajes simples.
- La exportación funciona mejor cuando consume una estructura común desde servidor y no reconstruye el fixture desde cero en cada formato.
- PDF y Excel sirven a casos distintos: PDF para compartir e imprimir, Excel para administración y edición posterior.
- La nueva restricción crítica del módulo es la disponibilidad de slots calendario; ahora el fixture puede fallar por falta de días/horas configurados, aunque la estructura deportiva sea válida.
- La exportación PDF ya no debe depender de archivos `.afm` del runtime; usa una librería que embebe fuentes estándar directamente en memoria.
