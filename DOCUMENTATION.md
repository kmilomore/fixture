# Fixture Pro — Documentación Técnica

Sistema web de gestión de torneos deportivos. Permite crear torneos, administrar equipos, generar fixtures y exportar resultados.

**Stack:** Next.js 16 · React 19 · TypeScript · Supabase (PostgreSQL) · Tailwind CSS 4 · Vercel

---

## Tabla de Contenidos

1. [Arquitectura general](#arquitectura-general)
2. [Base de datos](#base-de-datos)
3. [Variables de entorno](#variables-de-entorno)
4. [Módulos de la aplicación](#módulos-de-la-aplicación)
   - [Dashboard](#dashboard)
   - [Establecimientos](#establecimientos)
   - [Equipos](#equipos)
   - [Disciplinas y Categorías](#disciplinas-y-categorías)
   - [Torneos](#torneos)
   - [Fixture (detalle de torneo)](#fixture-detalle-de-torneo)
   - [Configuración](#configuración)
5. [API Routes](#api-routes)
6. [Librerías internas](#librerías-internas)
7. [Exportaciones](#exportaciones)
8. [Despliegue](#despliegue)

---

## Arquitectura general

```text
src/
├── app/
│   ├── layout.tsx              # Layout raiz: sidebar + header
│   ├── page.tsx                # Dashboard (/)
│   ├── api/                    # API Routes finas
│   ├── actions/                # Server Actions finas
│   ├── tournaments/
│   ├── establishments/
│   ├── teams/
│   ├── disciplines/
│   ├── fixture/
│   └── settings/
├── components/                 # UI compartida
├── features/                   # Dominio por modulo
│   ├── dashboard/
│   │   └── application/
│   ├── disciplines/
│   │   ├── domain/
│   │   └── application/
│   ├── establishments/
│   │   ├── domain/
│   │   └── application/
│   ├── fixture/
│   │   ├── domain/
│   │   ├── application/
│   │   └── presentation/
│   ├── teams/
│   │   └── application/
│   └── tournaments/
│       ├── domain/
│       └── application/
├── infrastructure/             # Adaptadores concretos
│   ├── database/
│   └── supabase/
└── lib/                        # Compatibilidad legacy residual
```

La aplicacion queda oficialmente orientada a web. Electron se elimina como objetivo de ejecucion y la logica central ya vive en `features/` e `infrastructure/`. `src/lib` queda solo para compatibilidad residual y utilidades legacy puntuales.

Reglas arquitectonicas vigentes:

- las paginas server consumen servicios compartidos, no rutas HTTP internas;
- las server actions consumen servicios compartidos, no la propia API;
- las API routes funcionan como adaptadores finos;
- `src/features/*` ya no depende de `@/lib/*`.

---

## Testing

El proyecto incorpora Vitest para cubrir dominio y servicios puros o con mocks de infraestructura.

### Comandos

```bash
npm test
npm run test:watch
```

### Cobertura inicial agregada

- `src/features/dashboard/application/dashboard-service.test.ts`
- `src/features/disciplines/application/catalog-service.test.ts`
- `src/features/fixture/domain/standings.test.ts`
- `src/features/disciplines/domain/catalog-normalization.test.ts`
- `src/features/establishments/domain/establishment-normalization.test.ts`

Objetivo de esta primera base:

- validar logica de dominio sin framework UI;
- probar servicios con mocks de Supabase;
- dejar una base de crecimiento para nuevas suites por feature.

---

## Base de datos

Proyecto Supabase: `vlwdwipenvqgnolfyjep`

Schema completo en `scripts/phppgadmin-schema.sql`.

### Tablas

#### `Establishment`
Instituciones (colegios, clubes) que participan en los torneos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID generado por la app |
| name | TEXT NOT NULL | Nombre del establecimiento |
| logoUrl | TEXT | URL del logo (opcional) |
| comuna | TEXT | Comuna/región |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Última modificación |

#### `Discipline`
Deportes disponibles (Fútbol, Básquetbol, Voleibol, Handball).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL UNIQUE | Nombre del deporte |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

#### `Category`
Categorías competitivas (Sub-14, Sub-17, Sub-18).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | Nombre de categoría |
| gender | TEXT NOT NULL | `Masculino` / `Femenino` / `Mixto` |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

#### `Team`
Equipos individuales vinculados a un establecimiento.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | Nombre del equipo |
| establishmentId | TEXT FK | Referencia a `Establishment` |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

#### `Tournament`
Competición que combina una disciplina y una categoría.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | Nombre del torneo |
| disciplineId | TEXT FK | Referencia a `Discipline` |
| categoryId | TEXT FK | Referencia a `Category` |
| format | TEXT | `LIGA` / `ELIMINATORIA` / `GRUPOS_ELIMINATORIA` / null |
| status | TEXT | `DRAFT` / `PLAYING` / `FINISHED` |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

#### `TournamentTeam`
Tabla de unión: equipos inscritos en un torneo.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| tournamentId | TEXT FK | Referencia a `Tournament` |
| teamId | TEXT FK | Referencia a `Team` |

Restricción: `UNIQUE(tournamentId, teamId)` — un equipo no puede inscribirse dos veces.

#### `Match`
Partidos generados por el fixture engine.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| tournamentId | TEXT FK | Referencia a `Tournament` |
| homeTeamId | TEXT FK nullable | Equipo local |
| awayTeamId | TEXT FK nullable | Equipo visitante |
| date | TIMESTAMP | Fecha programada |
| location | TEXT | Lugar del partido |
| homeScore | INT | Goles/puntos local |
| awayScore | INT | Goles/puntos visitante |
| isFinished | BOOL | Si el partido terminó |
| round | INT | Número de ronda/jornada |
| groupName | TEXT | Nombre del grupo (para formato grupos) |
| matchLogicIdentifier | TEXT | Identificador lógico para la llave (ej. `SF1`, `F`) |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### Permisos Supabase

Las tablas fueron creadas con SQL directo. Para que el cliente `anon` pueda leerlas y escribirlas, es necesario ejecutar en el SQL Editor de Supabase:

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
```

---

## Variables de entorno

### `.env` (local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://vlwdwipenvqgnolfyjep.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
ENABLE_STARTUP_SYNC=true   # opcional: activa seed de disciplinas/categorías al iniciar
```

### Vercel (producción)

Las mismas variables deben estar en **Settings → Environment Variables** del proyecto en Vercel. Vercel no lee el archivo `.env` local.

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon key) de Supabase |

---

## Módulos de la aplicación

---

### Dashboard

**Ruta:** `/`  
**Archivo:** `src/app/page.tsx`

Pantalla de inicio con tarjetas de estadísticas del sistema.

**Datos mostrados:**
- Total de establecimientos
- Total de equipos
- Total de torneos
- Total de partidos

Los datos se obtienen a traves de `src/features/dashboard/application/dashboard-service.ts`. La pagina `/` y `GET /api/dashboard` reutilizan el mismo servicio.

Si la API falla, muestra un estado de error con el mensaje "La base de datos todavia no responde con la estructura esperada".

---

### Establecimientos

**Ruta:** `/establishments`  
**Archivos:** `src/app/establishments/`

Gestión de instituciones participantes (colegios, clubes deportivos).

**Funcionalidades:**
- Listado en tabla con búsqueda por nombre
- Creación de nuevo establecimiento (nombre + comuna)
- Eliminación de establecimiento
- **Exportar CSV** — descarga todos los establecimientos en formato CSV
- **Importar CSV** — carga masiva desde archivo CSV con deduplicación automática

**Componentes:**
- `EstablishmentsTable.tsx` — tabla con búsqueda client-side
- `NewEstablishmentForm.tsx` — formulario de creación
- `DeleteEstablishmentButton.tsx` — botón con confirmación
- `CsvImporter.tsx` — UI de importación masiva
- `ExportEstablishmentsButton.tsx` — descarga CSV

**Importación CSV:**  
Acepta archivos con columnas `nombre` y `comuna`. La deduplicación usa normalización compartida en `src/features/establishments/domain/establishment-normalization.ts`. Al crear un establecimiento nuevo via importación, se crea automáticamente un equipo base con el mismo nombre.

**API:**  
`GET /api/establishments` — retorna lista con campo `teamsCount` (conteo de equipos por establecimiento)  
`POST /api/establishments` — crea establecimiento  
`PATCH /api/establishments/[id]` — actualiza nombre/comuna  
`DELETE /api/establishments/[id]` — elimina establecimiento  
`GET /api/establishments/export` — CSV de todos los establecimientos

---

### Equipos

**Ruta:** `/teams`  
**Archivos:** `src/app/teams/`

Directorio de todos los equipos del sistema.

**Funcionalidades:**
- Grid de tarjetas por equipo
- Cada tarjeta muestra nombre del equipo y establecimiento al que pertenece
- Crear nuevo equipo asociado a un establecimiento existente
- Eliminar equipo

**Componentes:**
- `Components.tsx` — `NewTeamForm` y `DeleteTeamButton`

**Relación:** Cada equipo pertenece a exactamente un establecimiento. Al crear un establecimiento se genera automáticamente un equipo base.

**API:**  
`GET /api/teams` — retorna todos los equipos con datos del establecimiento  
`POST /api/teams` — crea equipo (`name`, `establishmentId`)  
`DELETE /api/teams/[id]` — elimina equipo

---

### Disciplinas y Categorías

**Ruta:** `/disciplines`  
**Archivos:** `src/app/disciplines/`

Administración de deportes disponibles y categorías competitivas.

**Funcionalidades:**
- Dos columnas: Disciplinas | Categorías
- Agregar nueva disciplina (nombre)
- Agregar nueva categoría (nombre + género)
- Eliminar disciplinas y categorías

**Componentes:**
- `Forms.tsx` — formularios de creación
- `DeleteButtons.tsx` — botones de eliminación

**Datos por defecto:**  
Al iniciar la app con `ENABLE_STARTUP_SYNC=true`, el módulo `src/lib/catalogs.ts` inserta automáticamente:
- Disciplinas: Fútbol, Básquetbol, Voleibol, Handball
- Categorías: Sub-14, Sub-17, Sub-18 (Género: Mixto)

**API:**  
`GET /api/disciplines` — lista de disciplinas  
`POST /api/disciplines` — crea disciplina  
`DELETE /api/disciplines/[id]` — elimina disciplina  
`GET /api/categories` — lista de categorías  
`POST /api/categories` — crea categoría (`name`, `gender`)  
`DELETE /api/categories/[id]` — elimina categoría

---

### Torneos

**Ruta:** `/tournaments`  
**Archivos:** `src/app/tournaments/`

Listado y creación de torneos.

**Funcionalidades:**
- Grid de tarjetas por torneo
- Cada tarjeta muestra nombre, disciplina, categoría, estado, número de equipos y partidos
- Crear torneo (nombre + disciplina + categoría)
- Eliminar torneo
- Navegar al detalle del torneo

**Componentes:**
- `Components.tsx` — `NewTournamentForm`, `DeleteTournamentButton`

**Estados de un torneo:**
| Estado | Descripción |
|--------|-------------|
| `DRAFT` | Recién creado, sin fixture generado |
| `PLAYING` | Fixture generado, partidos en curso |
| `FINISHED` | Torneo finalizado |

**API:**  
`GET /api/tournaments` — lista con soporte de búsqueda (`?q=nombre`)  
`POST /api/tournaments` — crea torneo (`name`, `disciplineId`, `categoryId`)  
`DELETE /api/tournaments/[id]` — elimina torneo y sus partidos

---

### Fixture (detalle de torneo)

**Ruta:** `/tournaments/[id]`  
**Archivos:** `src/app/tournaments/[id]/`

Vista principal de gestión de un torneo específico. Es el módulo más complejo de la aplicación.

#### Secciones del detalle

**1. Información del torneo**  
Nombre, disciplina, categoría y estado (badge de color).

**2. Equipos inscritos** — `ClientComponents.tsx`  
- Lista de equipos actualmente inscritos
- Buscador para agregar equipos al torneo
- Botón para remover equipo del torneo

**3. Generación de fixture** — `FixtureEngine.tsx`

Controles disponibles según formato:

**Formato: Liga (Round-Robin)**
- Todos contra todos, cada equipo juega contra los demás
- Opción de ida y vuelta
- Número de jornadas calculado automáticamente

**Formato: Eliminatoria directa**
- Llave de eliminación, avanza el ganador
- Requiere potencia de 2 en número de equipos (4, 8, 16...)
- Rondas: Cuartos, Semifinal, Final

**Formato: Grupos + Eliminatoria**
- Fase de grupos (round-robin dentro del grupo)
- Fase eliminatoria con los clasificados de cada grupo
- Configurable: número de grupos

**Parámetros de programación (opcionales):**
- Fecha de inicio y fin del torneo
- Días de la semana habilitados (ej. sólo sábados)
- Franjas horarias disponibles
- Cantidad de partidos por jornada
- Duración estimada de cada partido

El engine asigna automáticamente fechas y horas a los partidos generados.

**4. Tabla de partidos**  
Muestra todos los partidos agrupados por jornada/ronda con:
- Equipos local y visitante
- Resultado (editable)
- Fecha y lugar (editables)
- Estado (jugado / pendiente)

**5. Exportaciones**  
Botones para descargar el fixture en:
- Excel (`.xlsx`) — con hoja de estadísticas y hoja de partidos
- PDF — reporte formateado

#### Flujo de uso típico

1. Crear torneo (`DRAFT`)
2. Inscribir equipos
3. Seleccionar formato y parámetros
4. Generar fixture → estado cambia a `PLAYING`
5. Registrar resultados de partidos
6. Exportar resultados

**API del módulo:**  
`GET /api/tournaments/[id]` — torneo completo con equipos y partidos  
`PATCH /api/tournaments/[id]` — actualiza nombre/estado/formato  
`POST /api/tournaments/[id]/teams` — inscribe equipo  
`DELETE /api/tournaments/[id]/teams/[teamEntryId]` — desincribe equipo  
`POST /api/tournaments/[id]/fixture/generate` — genera partidos  
`PUT /api/tournaments/[id]/fixture/format` — cambia formato del torneo  
`POST /api/tournaments/[id]/fixture/reset` — elimina todos los partidos del torneo  
`PATCH /api/matches/[id]` — actualiza resultado, fecha y lugar de un partido  
`GET /api/tournaments/[id]/export/excel` — descarga Excel  
`GET /api/tournaments/[id]/export/pdf` — descarga PDF

---

### Configuración

**Ruta:** `/settings`  
**Archivo:** `src/app/settings/page.tsx`

Información del sistema: versión, tecnologías utilizadas, variables de entorno activas.

---

## API Routes

Todas las rutas tienen `export const dynamic = "force-dynamic"` para deshabilitar caché en Vercel.

| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/dashboard` | GET | Contadores: establecimientos, equipos, torneos, partidos |
| `/api/categories` | GET, POST | Listar y crear categorías |
| `/api/categories/[id]` | PATCH, DELETE | Actualizar y eliminar categoría |
| `/api/disciplines` | GET, POST | Listar y crear disciplinas |
| `/api/disciplines/[id]` | PATCH, DELETE | Actualizar y eliminar disciplina |
| `/api/establishments` | GET, POST | Listar y crear establecimientos |
| `/api/establishments/[id]` | PATCH, DELETE | Actualizar y eliminar establecimiento |
| `/api/establishments/export` | GET | Descarga CSV de establecimientos |
| `/api/teams` | GET, POST | Listar y crear equipos |
| `/api/teams/[id]` | DELETE | Eliminar equipo |
| `/api/tournaments` | GET, POST | Listar (con búsqueda) y crear torneos |
| `/api/tournaments/[id]` | GET, PATCH, DELETE | Detalle, editar y eliminar torneo |
| `/api/tournaments/[id]/teams` | GET, POST | Equipos del torneo, inscribir equipo |
| `/api/tournaments/[id]/teams/[teamEntryId]` | DELETE | Desinscribir equipo |
| `/api/tournaments/[id]/fixture/generate` | POST | Generar partidos del fixture |
| `/api/tournaments/[id]/fixture/format` | PUT | Cambiar formato del torneo |
| `/api/tournaments/[id]/fixture/reset` | POST | Eliminar todos los partidos |
| `/api/tournaments/[id]/export/excel` | GET | Descargar Excel |
| `/api/tournaments/[id]/export/pdf` | GET | Descargar PDF |
| `/api/matches/[id]` | PATCH | Actualizar resultado/fecha/lugar de partido |

---

## Librerías internas

### `src/lib/supabase.ts`

Cliente Supabase. Crea una instancia nueva por llamada (apropiado para entornos serverless).

```ts
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

Todas las API routes importan `getSupabase()` para realizar queries.

---

### `src/lib/fixtureEngine.ts`

Motor de generación de fixtures. Exporta `generateFixtureMatches(teams, options)`.

**Algoritmos implementados:**

**Round-Robin (Liga):**  
Algoritmo de rotación circular. Con N equipos, genera N-1 jornadas (o 2×(N-1) para ida y vuelta). Si N es impar, agrega un equipo fantasma para los descansos.

**Eliminatoria directa:**  
Genera el árbol de eliminación. Requiere potencia de 2 en el número de equipos. Crea entradas con `matchLogicIdentifier` (ej. `SF1`, `SF2`, `F`) para identificar el partido lógico en la llave.

**Grupos + Eliminatoria:**  
Divide los equipos en N grupos, genera round-robin dentro de cada grupo, luego genera la fase eliminatoria para los clasificados.

**Scheduler:**  
Si se pasan parámetros de programación (`startDate`, `endDate`, `weekdays`, `timeSlots`, `matchesPerDay`), el engine itera por los días válidos y asigna slots de tiempo a cada partido.

---

### `src/lib/establishments.ts`

Lógica de importación y deduplicación de establecimientos.

**Funciones principales:**
- `parseEstablishmentsFromCsv(content)` — parsea CSV con columnas nombre/comuna
- `normalizeEstablishmentName(name)` — normaliza texto para comparación (lowercase, sin tildes, sin puntuación)
- `mergeEstablishments(existingId, duplicateId)` — fusiona duplicados, reasignando equipos y TournamentTeams al establecimiento canónico

---

### `src/lib/tournamentExports.ts`

Preparación de datos para exportación.

- Obtiene torneo completo con partidos y equipos
- Agrupa partidos por fase (jornada, grupo, ronda)
- Formatea fechas en español
- Genera nombres de archivo seguros (sin caracteres especiales)

Los archivos `excel/route.ts` y `pdf/route.ts` consumen esta librería para construir el documento final con `exceljs` y `pdf-lib`.

---

### `src/lib/serverApi.ts`

Utilidad para hacer fetch a las propias API routes desde Server Components.

```ts
export async function fetchServerApi<T>(path: string): Promise<T>
```

Construye la URL completa usando `VERCEL_URL` en producción o `localhost:3000` en desarrollo.

---

### `src/lib/catalogs.ts`

Seed de datos por defecto. Se ejecuta al iniciar la app si `ENABLE_STARTUP_SYNC=true` (o si no es producción).

Inserta disciplinas y categorías predefinidas usando `INSERT ... ON CONFLICT DO NOTHING` para no duplicar en cada reinicio.

---

## Exportaciones

### Excel (`/api/tournaments/[id]/export/excel`)

Genera un archivo `.xlsx` con dos hojas:
1. **Partidos** — tabla con jornada, equipos, resultado, fecha y lugar
2. **Resumen** — estadísticas del torneo

Usa la librería `exceljs`. El nombre del archivo se sanitiza a partir del nombre del torneo.

### PDF (`/api/tournaments/[id]/export/pdf`)

Genera un PDF con el fixture ordenado por jornada/ronda.

Usa la librería `pdf-lib`. Incluye cabecera con nombre del torneo, disciplina y categoría.

---

## Despliegue

### Vercel

El proyecto está configurado con `output: "standalone"` en `next.config.ts`.

**Pasos para desplegar:**

1. Conectar el repositorio GitHub en Vercel
2. En **Settings → Environment Variables**, agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Hacer deploy (automático en cada push a `main`)

Cada vez que se agreguen o modifiquen variables de entorno en Vercel, se debe hacer un **Redeploy manual** desde la pestaña Deployments.

### Supabase

La base de datos está en Supabase (proyecto `vlwdwipenvqgnolfyjep`).

**Setup inicial:**

1. Ejecutar el schema en SQL Editor de Supabase:  
   `scripts/phppgadmin-schema.sql`

2. Ejecutar los GRANTs de permisos:
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
   ```

3. Importar datos iniciales (opcional):  
   `scripts/import-establishments-phppgadmin.sql`

### Local

```bash
npm install
# Crear .env con las variables de entorno
npm run dev
```

La app corre en `http://localhost:3000`.
