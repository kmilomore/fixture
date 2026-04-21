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

## Arquitectura inicial

La fase 1 de refactorizacion deja el proyecto explicitamente orientado a web y abre una estructura limpia sin romper imports existentes:

```text
src/
	app/                # Rutas, layouts y componentes de pagina
	components/         # Componentes compartidos de UI
	features/           # Dominio y casos de uso por modulo
		fixture/
			domain/
		tournaments/
			domain/
	infrastructure/     # Adaptadores concretos a BD y servicios externos
		database/
		supabase/
	lib/                # Capa de compatibilidad temporal
```

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
