# Contexto de infrastructure/database

## Propósito

Entrega un pool PostgreSQL basado en `pg` para consultas residuales que no pasan por Supabase.

## Archivo clave

- `postgres.ts`
  - crea un `Pool` usando `DATABASE_URL`;
  - ajusta SSL según el host;
  - cachea el pool en `globalThis`.

## Hallazgos

- Este adaptador ya no debe ser el camino principal del negocio web.
- Su rol correcto es residual y controlado.

## Cosas que evitar

- No usar este adaptador para reconstruir casos de uso que ya existen en servicios sobre Supabase.
- No abrir pools nuevos por cada llamada.

## Ver también

- `src/infrastructure/contex.md`
- `src/infrastructure/supabase/contex.md`