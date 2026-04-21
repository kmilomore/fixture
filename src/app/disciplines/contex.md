# Contexto del módulo de disciplinas y categorías

## Ruta

- `/disciplines`

## Propósito

Este módulo define los catálogos deportivos con los que se crean torneos.

Administra dos entidades:

- disciplinas deportivas;
- categorías competitivas.

## Datos base disponibles

La aplicación sincroniza automáticamente un catálogo mínimo al iniciar:

- disciplinas: `Fútbol`, `Básquetbol`, `Vóleibol`, `Balonmano`;
- categorías: `Sub-14`, `Sub-17`, `Sub-18` con género `Mixto`.

Además, el usuario puede seguir agregando más disciplinas y categorías manualmente.

## Archivos clave

- `page.tsx`
  - Consulta disciplinas y categorías desde Prisma.
  - Renderiza dos paneles independientes.

- `Forms.tsx`
  - `AddDisciplineForm`
  - `AddCategoryForm`

- `DeleteButtons.tsx`
  - Elimina disciplinas y categorías.

- `../actions/disciplines.ts`
  - Acciones de alta y baja.
  - Deduplicación lógica por nombre normalizado.
  - Revalida `/disciplines` y `/tournaments`.

- `../../lib/catalogs.ts`
  - Mantiene la sincronización del catálogo base.

## Flujos de trabajo

### Carga automática del catálogo base

1. Al iniciar la app, el layout llama `ensureDefaultCatalogsLoaded()`.
2. Se consultan disciplinas y categorías existentes.
3. Se insertan solo las faltantes.
4. Nunca se eliminan registros creados por el usuario.

### Alta manual de disciplina

1. El usuario escribe el nombre.
2. La server action valida que no exista una variante normalizada equivalente.
3. Se crea la disciplina.
4. Se revalida la vista de disciplinas y la de torneos.

### Alta manual de categoría

1. El usuario indica `name` y `gender`.
2. La acción valida el par `nombre + género` como clave lógica.
3. Inserta si no existe.

## APIs y acciones disponibles

API HTTP:

- `GET /api/disciplines`
- `POST /api/disciplines`
- `GET /api/disciplines/:id`
- `PATCH /api/disciplines/:id`
- `DELETE /api/disciplines/:id`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

Acciones server heredadas:

- `createDiscipline(formData)`
- `deleteDiscipline(id)`
- `createCategory(formData)`
- `deleteCategory(id)`

## Dependencias

- `tournaments`
  - usa estos catálogos para crear torneos.

## Hallazgos

- Este módulo depende de sincronización automática, no de un seed manual.
- La decisión actual es conservar siempre el catálogo base y permitir extensiones locales.
- Si se eliminan registros base manualmente, la sincronización global volverá a reponerlos si faltan.
