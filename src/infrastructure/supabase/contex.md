# Contexto de infrastructure/supabase

## Propósito

Entrega el cliente principal de acceso a datos para la aplicación web.

## Archivo clave

- `client.ts`
  - expone `getSupabase()`.
  - construye el cliente desde variables públicas del proyecto.

## Llamadas relevantes

- `src/features/dashboard/application/dashboard-service.ts`
- `src/features/disciplines/application/catalog-service.ts`
- `src/features/establishments/application/establishment-service.ts`
- `src/features/teams/application/team-service.ts`
- `src/features/tournaments/application/tournament-service.ts`
- `src/features/fixture/application/fixture-service.ts`

## Hallazgos

- Este es el adaptador dominante de la app operativa.
- Si cambia su contrato o su inicialización, impacta casi todos los features.

## Cosas que evitar

- No crear variantes ad hoc del cliente por feature.
- No esconder aquí lógica de negocio o validaciones de aplicación.

## Ver también

- `src/infrastructure/contex.md`
- `src/features/contex.md`