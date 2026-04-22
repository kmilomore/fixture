# Contexto del feature establishments

## Propósito

Coordina el directorio institucional, su deduplicación y la carga masiva.

## Estructura

- `application/establishment-service.ts`
  - listado, detalle, alta, edición, baja y `bulkCreateEstablishments()`.
- `domain/establishment-normalization.ts`
  - normalización de nombre y comuna.

## Llamadas relevantes

- `src/app/establishments/* -> establishment-service`
- `src/app/actions/establishments.ts -> bulkCreateEstablishments()`
- `src/lib/establishments.ts` usa la misma lógica semántica para sincronización base.

## Hallazgos

- Este feature es una pieza maestra porque afecta equipos y preparación de torneos.
- La idempotencia de `bulkCreateEstablishments()` es parte del contrato del negocio.

## Cosas que evitar

- No disociar la importación manual de la deduplicación central del feature.
- No normalizar `comuna` de manera distinta entre sincronización base y altas manuales.

## Ver también

- `src/app/establishments/contex.md`
- `src/features/teams/contex.md`