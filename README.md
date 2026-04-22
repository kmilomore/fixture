# Fixture Pro

Sistema web para gestion de campeonatos, equipos, establecimientos y generacion de fixtures, desplegable como aplicacion web con Next.js.

## Stack actual

- Next.js App Router
- React 19
- TypeScript
- Supabase sobre PostgreSQL
- Vercel para despliegue web

## Variables de entorno

Configura estas variables en desarrollo local o en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="tu-clave-publica"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fixture_pro"
ENABLE_STARTUP_SYNC="true"
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` son obligatorias para las rutas y consultas sobre Supabase.
- `DATABASE_URL` se usa en los modulos que trabajan con SQL directo.
- `ENABLE_STARTUP_SYNC` activa la carga automatica de catalogos y establecimientos por defecto.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:3000`.

## Tests

La base de pruebas usa Vitest con entorno Node.

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Cobertura inicial agregada en esta fase:

- dominio puro de normalizacion;
- dominio de standings del fixture;
- servicios con mocks de Supabase para lecturas y validaciones puntuales.

## Índice de contexto técnico

### Capa app

- `src/app/contex.md`
- `src/app/disciplines/contex.md`
- `src/app/establishments/contex.md`
- `src/app/teams/contex.md`
- `src/app/tournaments/contex.md`
- `src/app/tournaments/[id]/contex.md`
- `src/app/fixture/contex.md`
- `src/app/settings/contex.md`

### Capa features

- `src/features/contex.md`
- `src/features/dashboard/contex.md`
- `src/features/disciplines/contex.md`
- `src/features/establishments/contex.md`
- `src/features/teams/contex.md`
- `src/features/tournaments/contex.md`
- `src/features/fixture/contex.md`

### Capa infrastructure

- `src/infrastructure/contex.md`
- `src/infrastructure/database/contex.md`
- `src/infrastructure/supabase/contex.md`

### Documento técnico principal

- `DOCUMENTATION.md`

El orden recomendado de lectura es:

1. `src/app/contex.md`
2. `src/features/contex.md`
3. `src/infrastructure/contex.md`
4. `DOCUMENTATION.md`

## Arquitectura actual

La refactorizacion deja el proyecto explicitamente orientado a web y ya consolidado alrededor de servicios compartidos por feature:

```text
src/
	app/                # Rutas, layouts y componentes de pagina
		api/            # Adaptadores HTTP finos
		actions/        # Server actions finas
	components/         # Componentes compartidos de UI
	features/           # Dominio, servicios y presentacion por modulo
		dashboard/
			tapplication/
		disciplines/
			domain/
			application/
		establishments/
			domain/
			application/
		fixture/
			domain/
			application/
			presentation/
		teams/
			application/
		tournaments/
			domain/
			application/
	infrastructure/     # Adaptadores concretos a BD y servicios externos
		database/
		supabase/
	lib/                # Compatibilidad legacy residual
```

Regla aplicada en esta fase:

- sin HTTP interno entre paginas/actions y la propia API;
- paginas server consumen servicios compartidos;
- routes y actions quedan como adaptadores finos.

## Base de datos

El proyecto es web-only. No mantiene una variante desktop ni una base local embebida.

La base recomendada es PostgreSQL alojado, por ejemplo:

- Supabase Postgres
- Neon
- Railway Postgres
- PostgreSQL administrado propio

## CSV de establecimientos

El directorio base sigue cargandose desde `public/formacion_directorio_territorio.csv` y se sincroniza automaticamente con la base de datos al iniciar la aplicacion.

La importacion manual acepta columnas como:

- `nombre`
- `name`
- `colegio`
- `establecimiento`

Ejemplo:

```csv
nombre,comuna
Colegio San Alberto,Santiago
Escuela Basica Norte,Puente Alto
Liceo Politecnico Sur,La Florida
```
