# Contexto del módulo de fixture general

## Ruta

- `/fixture`

## Propósito

Hoy este módulo no es el motor del fixture; es una puerta de entrada operativa.

Su función real es orientar al usuario hacia:

- torneos;
- establecimientos;
- equipos;
- disciplinas y categorías.

## Naturaleza del módulo

Es un módulo satélite de navegación.

No concentra reglas deportivas ni consultas complejas. La operación verdadera del fixture vive en `/tournaments/[id]`.

## Archivo clave

- `page.tsx`
  - no llama servicios de datos;
  - renderiza tarjetas de acceso rápido;
  - resume el mapa deportivo del sistema.

## Flujo actual

1. El usuario entra a `/fixture`.
2. Identifica el área que necesita operar.
3. Navega al módulo correcto.

## Relaciones reales

- `tournaments`
  - es el destino principal cuando se quiere operar un fixture real.
- `tournaments/[id]`
  - contiene fixture, calendario, resultados y exportaciones.
- `establishments`, `teams`, `disciplines`
  - alimentan la preparación previa al torneo.

## Hallazgos

- El nombre puede inducir a pensar que aquí hay un tablero global de partidos, pero no existe todavía.
- Si se quiere una vista transversal de todos los partidos del sistema, este módulo es el candidato natural.

## Cosas que evitar

- No empezar a duplicar aquí lógica que ya vive en `/tournaments/[id]`.
- No convertir esta pantalla en otro dashboard parcial sin una decisión explícita.
- No agregar llamadas de datos pesadas si su función sigue siendo navegación.

## Ver también

- `src/app/contex.md`
- `src/app/tournaments/contex.md`
- `src/app/tournaments/[id]/contex.md`
