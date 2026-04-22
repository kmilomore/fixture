# Contexto del feature dashboard

## Propósito

Este feature entrega una vista agregada del estado global del sistema.

Su contrato es simple:

- contar establecimientos;
- contar equipos;
- contar torneos;
- contar partidos.

## Superficie principal

- `application/dashboard-service.ts`
  - `getDashboardStats()`.

## Llamadas relevantes

- `src/app/page.tsx -> getDashboardStats()`
- `src/app/api/dashboard/route.ts -> getDashboardStats()`

## Hallazgos

- Es el feature más fino, pero importante porque demuestra el patrón correcto de servicio compartido entre página y API.
- Usa consultas `head` con conteo, lo que mantiene la operación barata y acotada.

## Cosas que evitar

- No duplicar la agregación en la API y en la página.
- No hacer que el dashboard consulte tablas completas si solo necesita conteos.

## Ver también

- `src/features/contex.md`
- `src/app/contex.md`