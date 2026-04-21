# Establecimientos: contexto del módulo

## Objetivo

Este módulo administra el directorio de establecimientos de la aplicación.

Actualmente cumple cuatro funciones principales:

1. Mantener un directorio base de escuelas y establecimientos disponible dentro de la app.
2. Permitir agregar nuevos establecimientos locales desde la interfaz.
3. Permitir importación y exportación CSV del padrón actual.
4. Sincronizar automáticamente un equipo base por cada establecimiento para que quede disponible en torneos.

## Alcance funcional

El módulo representa el registro maestro de instituciones.

Cada establecimiento puede:

- existir como registro base cargado desde el CSV integrado en la aplicación;
- existir como registro creado manualmente por el usuario;
- recibir equipos asociados;
- generar automáticamente un equipo homónimo si no existe.

## Archivos principales del módulo

### UI y página

- `page.tsx`
  - Página server component del módulo.
  - Consulta establecimientos desde Prisma.
  - Construye los datos serializables para la tabla.
  - Renderiza acciones principales: exportar, importar y crear.

- `EstablishmentsTable.tsx`
  - Componente client.
  - Muestra la información en formato tabla.
  - Implementa buscador por nombre.
  - Implementa filtro por comuna.
  - Expone acción de eliminación por fila.

- `NewEstablishmentForm.tsx`
  - Formulario client para alta manual.
  - Envía `name` y `comuna` a la server action.

- `CsvImporter.tsx`
  - Modal client para carga masiva por CSV.
  - Detecta columnas flexibles de nombre.
  - Detecta comuna si existe.
  - Previsualiza registros antes de importar.

- `DeleteEstablishmentButton.tsx`
  - Botón client para borrar un establecimiento.

- `ExportEstablishmentsButton.tsx`
  - Dispara la descarga del CSV actual desde una ruta API.

### Lógica de negocio y datos

- `../actions/establishments.ts`
  - Alta manual.
  - Eliminación.
  - Revalidación de vistas relacionadas.

- `../actions/fixture.ts`
  - Contiene la carga masiva de establecimientos desde CSV.

- `../../lib/establishments.ts`
  - Normalización de nombres.
  - Normalización de comuna.
  - Deduplicación.
  - Carga del CSV base.
  - Sincronización del directorio por defecto.
  - Sincronización automática de equipos homónimos.

- `../api/establishments/export/route.ts`
  - Exportación CSV del padrón vigente.

### Configuración y datos fuente

- `../../../public/formacion_directorio_territorio.csv`
  - Fuente base del directorio por defecto.
  - Se usa como catálogo integrado en la app.

- `../../../prisma/schema.prisma`
  - Define el modelo `Establishment`.
  - Actualmente se espera el campo `comuna` además de `name` y `logoUrl`.

## Modelo conceptual actual

### Establecimiento

Campos esperados a nivel funcional:

- `id`
- `name`
- `comuna`
- `logoUrl`
- `createdAt`
- `updatedAt`

### Relación con equipos

La aplicación trabaja ahora con la regla operativa:

- cada escuela o establecimiento debe existir también como equipo base.

Esto permite que el directorio de establecimientos no sea solo informativo, sino que sirva inmediatamente para alimentar torneos sin cargar manualmente un equipo por cada escuela.

## Flujo de trabajo principal

### 1. Disponibilidad del directorio base al iniciar la app

Flujo actual:

1. El layout principal llama a la rutina de sincronización del directorio base.
2. La rutina lee el CSV integrado en `public`.
3. Se normalizan nombres y comunas.
4. Se comparan contra la base local.
5. Si faltan establecimientos del catálogo base, se crean.
6. Si un establecimiento ya existe pero no tiene comuna y el CSV sí la trae, se actualiza.
7. Luego se sincronizan los equipos base homónimos.

Resultado esperado:

- el directorio base debe quedar siempre disponible en la aplicación, incluso si la base local no lo tiene completo;
- el usuario puede seguir agregando más establecimientos sin perder el catálogo base.

### 2. Alta manual de establecimiento

Flujo actual:

1. El usuario abre el formulario de nuevo establecimiento.
2. Ingresa nombre y comuna.
3. La server action valida que el nombre exista y no sea duplicado lógico.
4. Se crea el establecimiento.
5. Se ejecuta la sincronización de equipos base.
6. Se revalidan `/establishments`, `/teams` y `/`.

Resultado esperado:

- cada nuevo establecimiento manual también debería aparecer como equipo base automáticamente.

### 3. Importación CSV manual

Flujo actual:

1. El usuario selecciona un archivo CSV.
2. El cliente detecta columna de nombre usando alias flexibles.
3. Si existe columna `comuna`, también se toma.
4. Se construye una vista previa.
5. La server action deduplica registros por nombre normalizado.
6. Se insertan solo los faltantes.
7. Se sincronizan equipos base para los nuevos establecimientos.
8. Se revalidan vistas.

Columnas admitidas para nombre:

- `nombre`
- `name`
- `establecimiento`
- `colegio`
- `institución`
- `institucion`

Columnas admitidas para comuna:

- `comuna`
- `municipio`
- `ciudad`

### 4. Exportación CSV

Flujo actual:

1. El usuario presiona exportar.
2. La ruta API consulta establecimientos y conteo de equipos.
3. Se genera un CSV con el estado actual de la base.

Columnas exportadas:

- `id`
- `nombre`
- `comuna`
- `equipos`
- `creado_en`
- `actualizado_en`

### 5. Visualización y consulta

La pantalla actual del módulo usa una tabla con:

- buscador por nombre de escuela o establecimiento;
- filtro por comuna;
- columna de cantidad de equipos;
- columna de fecha de creación;
- acción de eliminación por fila.

## Regla de deduplicación

La deduplicación actual no compara texto literal, sino nombre normalizado.

Normalización aplicada:

- quita tildes;
- convierte a minúsculas;
- reemplaza caracteres no alfanuméricos por espacios;
- colapsa espacios múltiples.

Ejemplos que se consideran equivalentes:

- `Colegio San José`
- `COLEGIO SAN JOSE`
- `Colegio-San José`

## Decisiones de diseño actuales

### Directorio base persistente

Se decidió que el CSV integrado no sea solo una carga inicial única, sino una fuente de sincronización.

Esto significa:

- si faltan establecimientos base, la app debe reponerlos;
- si el usuario agregó establecimientos nuevos, esos se conservan;
- el catálogo base y los datos locales conviven en la misma tabla.

### Equipos automáticos por establecimiento

Se decidió que las escuelas sean también equipos base.

Esto reduce fricción operativa porque:

- evita crear manualmente un equipo por cada escuela;
- deja el módulo de torneos listo para operar apenas existe el directorio;
- mantiene consistencia entre establecimiento y equipo principal.

## Hallazgos técnicos

### Hallazgo 1: el módulo ya no es solo un CRUD

El módulo se transformó en un punto de sincronización entre tres fuentes:

- CSV base integrado;
- base local SQLite;
- módulo de equipos.

Por eso cualquier cambio aquí impacta directamente la disponibilidad de equipos y la preparación de torneos.

### Hallazgo 2: `comuna` requiere sincronización real de Prisma

Se incorporó el campo `comuna` en el esquema funcional, pero apareció un desfase típico:

- la UI y la lógica ya intentan usar `establishment.comuna`;
- si el cliente Prisma o la base no están actualizados, TypeScript y Prisma quedan fuera de sincronía.

Consecuencia práctica:

- hay que ejecutar la actualización de Prisma antes de considerar estable este cambio.

### Hallazgo 3: la sincronización automática debe ser idempotente

La rutina de carga base debe poder ejecutarse muchas veces sin duplicar datos.

Eso obliga a:

- deduplicar por nombre normalizado;
- insertar solo faltantes;
- actualizar solo atributos vacíos o incompletos cuando corresponda.

### Hallazgo 4: borrar establecimientos puede tener efecto en cascada operativo

Eliminar un establecimiento puede impactar:

- equipos asociados;
- selección de equipos para torneos;
- consistencia del directorio base si luego la sincronización vuelve a reponerlo.

Esto debe tratarse como una decisión funcional, no solo técnica.

## Riesgos y pendientes

### Pendiente crítico

Actualizar Prisma para que `comuna` exista efectivamente en el cliente generado y en la base local.

Pendientes esperables:

1. aplicar migración o sincronización de esquema;
2. regenerar cliente Prisma;
3. volver a ejecutar build.

### Pendiente funcional

Definir política de eliminación del catálogo base.

Preguntas abiertas:

- si un establecimiento base se elimina manualmente, ¿la sincronización debe reponerlo?
- o ¿debería existir una marca que diferencie catálogo base de registros locales?

Hoy, por la dirección actual del módulo, la expectativa funcional es que el directorio base esté siempre disponible.

### Pendiente de UX

La tabla aún puede crecer en capacidades:

- paginación;
- orden por columnas;
- indicador visual de si el registro viene del catálogo base o fue creado localmente.

## Dependencias cruzadas

El módulo de establecimientos afecta directamente:

- `teams`: porque sincroniza equipos base homónimos.
- `tournaments`: porque depende de que existan equipos para inscribir.
- `dashboard`: porque revalida conteos al crear o borrar.

## Estado esperado del módulo después de estabilizar Prisma

Cuando el ajuste de Prisma esté completo, el comportamiento objetivo de la carpeta debe ser:

1. el directorio base siempre está disponible en la app;
2. el usuario puede agregar más establecimientos locales;
3. cada establecimiento tiene su equipo base automático;
4. la vista principal es tabular, con buscador y filtro por comuna;
5. la exportación CSV refleja el estado real de la base local.
