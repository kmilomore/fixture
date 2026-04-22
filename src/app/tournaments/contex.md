# Contexto del módulo de torneos

## Rutas

- `/tournaments`
- `/tournaments/[id]`

## Propósito

Este módulo es la puerta de entrada al negocio deportivo real.

Tiene dos niveles:

- nivel macro: crear, listar y eliminar torneos;
- nivel operativo: derivar al detalle donde vive la gestión del torneo concreto.

## Qué resuelve este módulo

- creación del torneo con disciplina y categoría válidas;
- listado y borrado;
- enlace hacia el centro operativo del detalle;
- preparación de un flujo deportivo con grupos, seeds y calendario real;
- compatibilidad con esquemas parcialmente migrados.

## Archivos y llamadas relevantes

- `page.tsx`
  - carga torneos, disciplinas y categorías.
  - muestra errores visibles de carga.

- `Components.tsx`
  - formulario de alta y botón de baja.

- `../actions/tournaments.ts`
  - llama a `src/features/tournaments/application/tournament-service.ts`.
  - también coordina inscripción y remoción de equipos.

- `../api/tournaments/route.ts`
  - `GET` y `POST` HTTP.

- `../api/tournaments/[id]/route.ts`
  - detalle, edición y eliminación vía HTTP.

- `src/features/tournaments/application/tournament-service.ts`
  - listado, detalle, CRUD y relaciones con equipos.

## Flujos principales

### Creación del torneo

1. La UI requiere nombre, disciplina y categoría.
2. La action delega al servicio.
3. El servicio inserta y aplica fallback si faltan columnas nuevas en el esquema.
4. Se revalida dashboard y listado.

### Preparación para operar

1. El usuario entra al detalle del torneo.
2. Inscribe equipos antes de generar fixture.
3. Configura formato, grupos, cabezas de serie y reglas calendario.
4. Puede separar lectura por fase grupal, eliminatoria y calendario.
5. Desde ahí entra al flujo deportivo de `/tournaments/[id]`.

### Compatibilidad de esquema

1. Si faltan columnas nuevas de scheduling o match status, el servicio usa selects legados.
2. La UI sigue operando con degradación controlada.

## Relaciones con otros módulos

- `disciplines`
  - define los catálogos necesarios para crear torneos.
- `teams`
  - aporta los equipos inscribibles.
- `establishments`
  - aporta el nombre institucional visible del selector de equipos.
- `tournaments/[id]`
  - concentra el trabajo deportivo y operativo real.

## Hallazgos

- Este módulo dejó de ser solo alta/baja de torneos; es el puente entre maestros y operación real.
- La compatibilidad con esquema legado sigue siendo importante para no romper listados o detalles en despliegues intermedios.
- La calidad del selector de inscripción impacta fuertemente la operación cuando el padrón crece.
- El detalle del torneo ya no solo genera partidos: ahora también refleja clasificación grupal y progresión automática hacia llaves.

## Cosas que evitar

- No dejar errores silenciosos en el listado.
- No mezclar aquí la lógica detallada del fixture; eso pertenece a `/tournaments/[id]`.
- No permitir duplicados de inscripción del mismo equipo.
- No volver a usar la API propia por HTTP desde la página o actions.

## Ver también

- `src/app/contex.md`
- `src/app/disciplines/contex.md`
- `src/app/teams/contex.md`
- `src/app/tournaments/[id]/contex.md`
