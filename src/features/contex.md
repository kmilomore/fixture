# Contexto general de features

## Propósito

`src/features` concentra la lógica reutilizable del sistema.

Esta capa existe para evitar que:

- las páginas server implementen reglas de negocio;
- las server actions mezclen validación y persistencia;
- las API routes se conviertan en controladores gordos.

## Estructura vigente

- `dashboard`
  - métricas agregadas.
- `disciplines`
  - catálogos y normalización.
- `establishments`
  - directorio institucional y carga masiva.
- `fixture`
  - motor deportivo, standings, progresión, presentación y operación de partidos.
- `teams`
  - inventario de equipos inscribibles.
- `tournaments`
  - agregado principal del torneo, sus estados y relaciones.

## Regla de organización

Cuando un feature lo necesita, se divide en:

- `domain`
  - reglas puras, tipos y transformaciones sin infraestructura.
- `application`
  - casos de uso coordinando validaciones, repositorios/adaptadores y errores.
- `presentation`
  - componentes de UI especializados del feature.

## Contrato de llamadas

- `src/app/page.tsx` y páginas server llaman `features/*/application`.
- `src/app/actions/*` llaman `features/*/application`.
- `src/app/api/*` llaman `features/*/application`.
- `domain` no debe conocer Next, Supabase ni revalidación.

## Hallazgos

- `fixture` y `tournaments` son los features más acoplados por naturaleza del negocio.
- `disciplines`, `establishments` y `teams` funcionan como módulos maestros que preparan el terreno del torneo.
- La calidad de esta capa define si la app puede mantenerse sin volver a HTTP interno o lógica duplicada.

## Cosas que evitar

- No mover revalidaciones de Next a `features`.
- No hacer que `domain` dependa de `getSupabase()` o `Request/Response`.
- No duplicar normalización o estados en varios features.

## Ver también

- `src/app/contex.md`
- `src/infrastructure/contex.md`
- `DOCUMENTATION.md`