# Contexto del módulo de disciplinas y categorías

## Ruta

- `/disciplines`

## Propósito

Este módulo mantiene los catálogos deportivos que habilitan todo el flujo posterior.

Sin disciplinas y categorías válidas:

- no se pueden crear torneos correctamente;
- el formulario de torneos queda bloqueado;
- la sincronización de arranque pierde parte de su valor operativo.

## Qué administra

- disciplinas deportivas;
- categorías competitivas;
- deduplicación lógica por normalización;
- catálogo mínimo de arranque.

## Archivos y llamadas relevantes

- `page.tsx`
  - pinta dos superficies: disciplinas y categorías.
  - consume datos ya resueltos por la capa de aplicación.

- `Forms.tsx`
  - alta de disciplina;
  - alta de categoría.

- `DeleteButtons.tsx`
  - eliminación controlada.

- `../actions/disciplines.ts`
  - llama a `src/features/disciplines/application/catalog-service.ts`.
  - revalida `/disciplines` y `/tournaments`.

- `src/features/disciplines/application/catalog-service.ts`
  - listado, alta, edición y baja.

- `src/features/disciplines/domain/catalog-normalization.ts`
  - normalización y deduplicación semántica.

- `src/lib/catalogs.ts`
  - sincronización del catálogo base durante el arranque.

## Flujos principales

### Sincronización automática del catálogo base

1. `layout.tsx` ejecuta la carga base al arrancar.
2. Se consultan disciplinas y categorías existentes.
3. Se insertan solo faltantes.
4. Lo creado por usuario no se elimina.

### Alta manual de disciplina

1. La UI envía nombre.
2. La server action deriva al servicio.
3. El servicio normaliza y deduplica.
4. Si pasa validación, inserta.
5. Se revalida la lista y el formulario de torneos.

### Alta manual de categoría

1. La UI envía `name` y `gender`.
2. El servicio trata `nombre + género` como clave lógica.
3. Inserta solo si no existe un equivalente normalizado.

## Relaciones con otros módulos

- `tournaments`
  - depende directamente de estos catálogos para crear torneos.
- `src/app/contex.md`
  - explica por qué este módulo es un maestro y no solo un CRUD.

## Hallazgos

- Este módulo condiciona el resto del sistema aunque su UI sea pequeña.
- La sincronización de arranque es parte del contrato funcional, no solo una conveniencia.
- La normalización de nombres evita una gran parte de la basura de catálogo sin necesidad de reglas complejas en UI.

## Cosas que evitar

- No validar duplicados solo por texto literal.
- No mover la normalización a formularios cliente.
- No permitir que el formulario de torneos dependa de datos crudos sin saneamiento.
- No romper la revalidación de `/tournaments`, porque este módulo impacta su formulario.

## Ver también

- `src/app/contex.md`
- `src/app/tournaments/contex.md`
- `DOCUMENTATION.md`
