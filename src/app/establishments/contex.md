# Contexto del módulo de establecimientos

## Ruta

- `/establishments`

## Propósito

Este es el registro maestro institucional del sistema.

No solo guarda establecimientos: también condiciona la disponibilidad de equipos base y, por extensión, la capacidad de preparar torneos.

## Responsabilidades actuales

- mantener un directorio base integrado en la app;
- permitir altas manuales;
- importar y exportar CSV;
- deduplicar por nombre normalizado;
- sincronizar equipos base homónimos.

## Archivos y llamadas relevantes

- `page.tsx`
  - carga la vista principal del directorio.

- `EstablishmentsTable.tsx`
  - tabla con búsqueda, filtro por comuna y acciones por fila.

- `NewEstablishmentForm.tsx`
  - alta manual.

- `CsvImporter.tsx`
  - previsualización y carga masiva.

- `ExportEstablishmentsButton.tsx`
  - dispara `GET /api/establishments/export`.

- `../actions/establishments.ts`
  - llama a `src/features/establishments/application/establishment-service.ts`.
  - también concentra `bulkCreateEstablishments()`.

- `src/features/establishments/application/establishment-service.ts`
  - CRUD y carga masiva.

- `src/features/establishments/domain/establishment-normalization.ts`
  - normalización y deduplicación.

- `src/lib/establishments.ts`
  - sincronización del CSV base y de equipos base durante arranque.

## Flujos principales

### Sincronización del directorio base

1. El layout ejecuta la rutina base.
2. Se lee `public/formacion_directorio_territorio.csv`.
3. Se normalizan nombre y comuna.
4. Se insertan faltantes.
5. Se actualizan comunas vacías si el CSV trae valor.
6. Se sincronizan equipos base.

### Alta manual

1. El usuario envía nombre y comuna.
2. La action llama al servicio.
3. El servicio valida duplicado lógico.
4. Inserta el establecimiento.
5. Se sincroniza equipo base y se revalidan vistas dependientes.

### Importación CSV manual

1. El cliente detecta columnas alias para nombre y comuna.
2. Se arma una vista previa.
3. La action ejecuta `bulkCreateEstablishments()`.
4. El servicio inserta solo faltantes.
5. Se sincronizan equipos base de los nuevos registros.

### Exportación CSV

1. La UI llama a `GET /api/establishments/export`.
2. La route usa el mismo origen de datos actual del módulo.
3. Exporta padrón con comuna, cantidad de equipos y timestamps.

## Relaciones con otros módulos

- `teams`
  - depende de este módulo para el origen institucional.
- `tournaments`
  - se beneficia de tener equipos listos derivados del padrón.
- `src/app/contex.md`
  - explica por qué este módulo afecta el arranque global.

## Hallazgos

- Este módulo ya no es un CRUD aislado; es una bisagra entre catálogo base, datos locales y equipos.
- La idempotencia de la sincronización es obligatoria, no opcional.
- El campo `comuna` ya forma parte del contrato funcional y debe mantenerse alineado en esquema, API y UI.

## Cosas que evitar

- No deduplicar por texto literal.
- No romper la sincronización con equipos base al mover lógica de importación.
- No tratar la eliminación como una baja inocua; puede afectar equipos y torneos.
- No separar el CSV base del contrato del módulo sin reemplazar esa fuente de verdad.

## Ver también

- `src/app/contex.md`
- `src/app/teams/contex.md`
- `src/app/tournaments/contex.md`
