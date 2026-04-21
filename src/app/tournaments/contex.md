# Contexto del módulo de torneos

## Rutas

- `/tournaments`
- `/tournaments/[id]`

## Propósito

Este módulo administra la vida completa de un torneo:

- creación;
- eliminación;
- selección de disciplina y categoría;
- búsqueda, selección e inscripción de escuelas/equipos;
- acceso al motor de fixture;
- configuración de formatos avanzados, grupos y calendario automático.

## Archivos clave

- `page.tsx`
  - Lista torneos existentes.
  - Obtiene disciplinas y categorías para el formulario de alta.

- `Components.tsx`
  - `NewTournamentForm`
  - `DeleteTournamentButton`

- `../actions/tournaments.ts`
  - acciones de creación, eliminación y manejo de equipos dentro del torneo.

- `[id]/page.tsx`
  - detalle del torneo.

- `[id]/ClientComponents.tsx`
  - gestión de inscripción y baja de equipos.
  - buscador por nombre de escuela o equipo.
  - selector controlado para evitar pérdidas de selección.

- `[id]/FixtureEngine.tsx`
  - configurador y visualización del fixture.

## Flujos de trabajo

### Creación de torneo

1. El usuario abre el formulario.
2. Indica nombre, disciplina y categoría.
3. Si faltan catálogos, la UI bloquea la creación.
4. La server action crea el torneo y revalida dashboard y listado.

### Gestión de equipos dentro del torneo

1. En `/tournaments/[id]`, si el fixture no fue generado, se muestra `ManageTournamentTeams`.
2. La columna izquierda muestra un buscador y un selector de escuelas/equipos aún no inscritos.
3. El usuario puede escribir parte del nombre de la escuela o del equipo para reducir el listado.
4. El selector muestra cada opción como `Escuela · Equipo` para facilitar la lectura.
5. Tras seleccionar una opción, la UI muestra un resumen breve del seleccionado.
6. El botón `Agregar al torneo` inserta la relación y limpia la búsqueda.
7. Se pueden quitar relaciones antes de generar el fixture.

### Flujo esperado del selector de escuelas/equipos

1. El usuario entra al detalle del torneo en estado `DRAFT`.
2. Escribe el nombre de la escuela en el buscador.
3. El listado se filtra por coincidencias en nombre del establecimiento o del equipo.
4. El usuario selecciona la opción correcta en el dropdown.
5. La UI confirma visualmente cuál quedó seleccionada.
6. Al agregarla, desaparece del listado de disponibles y pasa a participantes.

### Qué debe hacer esta sección

- Permitir encontrar rápido una escuela aunque existan muchas cargadas.
- Mantener visible y estable la selección elegida.
- Evitar que el selector desborde su columna o quede detrás del bloque de formato.
- Impedir la inscripción duplicada del mismo equipo dentro del torneo.

### Qué se debe evitar

- No depender de un `select` no controlado cuando la lista es larga.
- No permitir que el layout del formulario empuje el panel de fixture.
- No mostrar en el dropdown equipos ya inscritos en el torneo.
- No permitir generar fixture si no hay al menos dos equipos.

### Transición a fixture

1. Se elige formato.
2. Si corresponde, se define cantidad de grupos.
3. Se define el calendario disponible: rango de fechas, días y franja horaria.
4. Se generan partidos y se les asignan slots automáticamente.
5. El estado del torneo cambia a `PLAYING`.
6. Desde ese punto la UI ya no muestra la edición de inscripciones sino el listado de participantes y el motor del fixture.

## APIs y acciones disponibles

API HTTP de torneos:

- `GET /api/tournaments`
- `POST /api/tournaments`
- `GET /api/tournaments/:id`
- `PATCH /api/tournaments/:id`
- `DELETE /api/tournaments/:id`
- `GET /api/tournaments/:id/teams`
- `POST /api/tournaments/:id/teams`
- `DELETE /api/tournaments/:id/teams/:teamEntryId`

Rutas API de exportación del fixture:

- `/api/tournaments/[id]/export/pdf`
- `/api/tournaments/[id]/export/excel`

Acciones server heredadas:

- `createTournament(formData)`
- `deleteTournament(id)`
- `addTeamToTournament(tournamentId, teamId)`
- `removeTeamFromTournament(id, tournamentId)`

Acciones relacionadas desde el motor de fixture:

- `setTournamentFormat(...)`
- `generateFixture(...)`
- `resetFixture(...)`
- `updateMatchResult(...)`

## Dependencias

- `disciplines`
- `teams`
- `fixture`
- `establishments`
  - aporta el nombre visible de la escuela en el selector.

## Hallazgos

- El módulo está dividido correctamente entre listado, detalle y motor de partidos.
- La UI asume que la inscripción de equipos termina antes de generar el fixture.
- No existe aún una política explícita para pasar de `PLAYING` a `FINISHED`.
- La búsqueda por escuela es necesaria porque el directorio base puede ser grande.
- El texto visible del selector debe priorizar el nombre de la escuela para que la selección sea más intuitiva.
- El comportamiento correcto de esta sección depende de mantener el selector como componente controlado.
- El módulo ya no solo crea torneos: ahora también resuelve la calendarización operativa del fixture.
- La API HTTP permite desacoplar frontend, automatizaciones o clientes externos del acceso directo a PostgreSQL.
