# Contexto del feature disciplines

## Propósito

Mantiene el catálogo deportivo base y extendido del sistema.

## Estructura

- `application/catalog-service.ts`
  - listados, detalle, altas, ediciones y bajas de disciplinas y categorías.
- `domain/catalog-normalization.ts`
  - normalización del nombre para deduplicación lógica.

## Llamadas relevantes

- `src/app/disciplines/* -> catalog-service`
- `src/app/tournaments/page.tsx -> listCatalogs(), listCategories()`
- `src/lib/catalogs.ts` usa la misma semántica de catálogo para la sincronización base.

## Hallazgos

- Este feature no es grande, pero es maestro: si falla, bloquea el alta de torneos.
- Su valor real está en la consistencia del catálogo, no en la complejidad de UI.

## Cosas que evitar

- No validar duplicados solo en cliente.
- No separar categorías de disciplinas en servicios inconexos si siguen compartiendo el mismo flujo operativo.

## Ver también

- `src/app/disciplines/contex.md`
- `src/features/contex.md`