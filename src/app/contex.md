# Contexto general de la aplicación

## Alcance

Este archivo es el hub general de `src/app`.

Debe leerse antes de entrar a los contextos específicos de cada módulo porque resume:

- el mapa de rutas;
- los flujos transversales;
- las llamadas entre UI, actions, API y servicios;
- las relaciones entre módulos;
- los puntos sensibles que no conviene romper.

## Mapa de módulos

- `/`
  - dashboard operativo y punto de entrada.
- `/disciplines`
  - catálogo de disciplinas y categorías.
- `/establishments`
  - directorio maestro de establecimientos e importación/exportación CSV.
- `/teams`
  - equipos disponibles para inscripción en torneos.
- `/tournaments`
  - alta, listado y administración macro de torneos.
- `/tournaments/[id]`
  - centro operativo del torneo: equipos, fixture, calendario, exportaciones y resultados.
- `/fixture`
  - landing de navegación deportiva.
- `/settings`
  - superficie informativa; hoy no administra configuración persistente.

## Contrato arquitectónico vigente

### Capa de entrega

`src/app/**` contiene páginas, rutas API y server actions.

Regla actual:

- las páginas server llaman servicios compartidos;
- las server actions llaman servicios compartidos;
- las API routes son adaptadores finos;
- no se usa HTTP interno entre páginas/actions y la propia API.

### Capa de aplicación

`src/features/**/application` concentra casos de uso compartidos.

Servicios relevantes:

- `dashboard-service`
- `catalog-service`
- `establishment-service`
- `team-service`
- `tournament-service`
- `fixture-service`

### Capa de dominio

`src/features/**/domain` concentra reglas puras.

Hoy los contratos más sensibles son:

- `tournament-lifecycle`
- `match-lifecycle`
- `fixture-engine`
- `standings`
- `progression`
- normalizadores de catálogos y establecimientos.

### Infraestructura

- Supabase es el acceso principal a datos operativos.
- `pg` queda para utilidades residuales, no para coordinar el flujo principal de la app.

## Flujo transversal principal

### Arranque de la aplicación

1. `layout.tsx` monta la estructura global.
2. Se ejecuta la sincronización de catálogos base.
3. Se ejecuta la sincronización del directorio de establecimientos y equipos base.
4. Se renderiza el módulo solicitado.

Consecuencia:

- el layout no es pasivo;
- cualquier degradación en estas rutinas impacta toda la navegación.

### Creación de entidades maestras

1. `disciplines` asegura el catálogo deportivo.
2. `establishments` mantiene el padrón institucional.
3. `teams` expone equipos disponibles, incluidos los equipos base sincronizados.
4. `tournaments` consume esos tres módulos para crear el torneo y prepararlo para fixture.

### Operación deportiva

1. En `/tournaments/[id]` se inscriben equipos.
2. Se define formato y reglas de calendarización.
3. `fixture-service` genera partidos.
4. `progression` completa automáticamente cruces dependientes cuando hay clasificados o ganadores resueltos.
5. `standings` construye la tabla de posiciones para la fase grupal.
6. `CalendarView` reordena la lectura operativa por fecha real.
7. PDF y Excel exportan la misma estructura que usa el detalle del torneo.

## Llamadas clave entre módulos

### Llamadas salientes del hub raíz

- `layout.tsx -> src/lib/catalogs.ts`
- `layout.tsx -> src/lib/establishments.ts`
- `page.tsx -> src/features/dashboard/application/dashboard-service.ts`

### Dependencias cruzadas más importantes

- `tournaments -> disciplines`
  - necesita disciplina y categoría válidas.
- `tournaments -> teams`
  - necesita equipos disponibles para inscripción.
- `teams -> establishments`
  - un equipo pertenece a un establecimiento.
- `establishments -> teams`
  - crea y mantiene equipos base homónimos.
- `tournaments/[id] -> fixture`
  - opera reglas de formato, standings, progresión y exportación.

## Hallazgos consolidados

- El sistema real no parte en torneos; parte en catálogos y padrón institucional.
- El mayor punto de acoplamiento está en `/tournaments/[id]`, porque junta estado del torneo, estado del partido, clasificación y calendario.
- La exportación ahora debe seguir el mismo agregado de `getTournamentDetail()` para no divergir de lo que ve la UI.
- El layout sigue siendo un punto de riesgo por hacer sincronización global en tiempo de render.

## Cosas que evitar

- No reintroducir llamadas HTTP internas entre páginas/actions y `/api/**`.
- No duplicar reglas deportivas entre UI, API y servicios.
- No mover lógica de clasificación o progresión al componente cliente.
- No hacer exportaciones con una consulta paralela que devuelva una versión distinta del torneo.
- No agregar sincronización global adicional al layout sin medir su costo.

## Guía de lectura recomendada

1. Leer este archivo.
2. Leer `disciplines`, `establishments` y `teams` para entender los maestros.
3. Leer `tournaments` para el flujo macro.
4. Leer `tournaments/[id]` para la operación real del negocio.
5. Leer `fixture` y `settings` solo como módulos satélite.

## Ver también

- `src/app/disciplines/contex.md`
- `src/app/establishments/contex.md`
- `src/app/teams/contex.md`
- `src/app/tournaments/contex.md`
- `src/app/tournaments/[id]/contex.md`
- `DOCUMENTATION.md`
