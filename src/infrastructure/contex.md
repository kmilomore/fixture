# Contexto general de infrastructure

## Propósito

`src/infrastructure` concentra adaptadores concretos hacia servicios externos.

Hoy su responsabilidad es pequeña y clara:

- entregar un cliente Supabase operativo;
- entregar un pool PostgreSQL para usos residuales.

## Submódulos actuales

- `supabase`
  - cliente principal para la app operativa.
- `database`
  - pool `pg` para consultas residuales o utilidades puntuales.

## Contrato con features

- `features/*/application` puede depender de infrastructure.
- `features/*/domain` no debe depender de infrastructure.
- `src/app` no debería saltarse features para hablar directo con infraestructura salvo en utilidades muy excepcionales.

## Hallazgos

- La dirección correcta del proyecto es que Supabase sea el adaptador principal del negocio web.
- `pg` sigue existiendo, pero no debe volver a convertirse en un camino paralelo para el mismo caso de uso.

## Cosas que evitar

- No duplicar acceso a la misma entidad por dos adaptadores distintos dentro del mismo flujo.
- No filtrar detalles de conexión hacia la capa de app.

## Ver también

- `src/features/contex.md`
- `src/app/contex.md`