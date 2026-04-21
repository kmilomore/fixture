# Contexto del módulo raíz

## Ruta

- `/`

## Propósito

La carpeta raíz de `src/app` concentra el layout general, el dashboard principal y la inicialización de catálogos base del sistema.

## Archivos clave

- `layout.tsx`
  - Define la estructura general con sidebar y cabecera.
  - Ejecuta sincronizaciones globales al iniciar render del árbol:
    - catálogos base de disciplinas y categorías;
    - directorio base de establecimientos y equipos automáticos.

- `page.tsx`
  - Dashboard general.
  - Muestra conteos de establecimientos, equipos y torneos.
  - Actualmente deja `Partidos Jugados` fijo en `0`.

- `globals.css`
  - Estilos globales mínimos.

## Flujos relevantes

### Inicialización global

1. El layout se renderiza.
2. Se llama a `ensureDefaultCatalogsLoaded()`.
3. Se llama a `ensureDefaultEstablishmentsLoaded()`.
4. Luego se renderiza el módulo solicitado por ruta.

Esto significa que el módulo raíz actúa como punto de entrada operativo para poblar datos base locales.

## Dependencias cruzadas

- `src/lib/catalogs.ts`
- `src/lib/establishments.ts`
- `src/components/layout/Sidebar.tsx`

## Hallazgos

- El layout no es solo visual; también ejecuta lógica de sincronización de datos.
- Si la sincronización se vuelve lenta, impacta el tiempo de carga inicial de toda la app.
- El dashboard aún no consulta partidos jugados reales; hoy es una tarjeta placeholder.
