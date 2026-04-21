# Fixture Pro

Sistema web para gestión de campeonatos, equipos, establecimientos y generación de fixtures, preparado para despliegue en Vercel con base de datos PostgreSQL alojada.

## Stack objetivo

- Next.js App Router
- Prisma ORM
- PostgreSQL hospedado
- Vercel para despliegue web

## Variables de entorno

Crea tus variables desde [.env.example](c:/Users/camil/OneDrive/Documentos/programa%20fixture/.env.example) o configúralas directamente en Vercel:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fixture_pro?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/fixture_pro?schema=public"
```

Notas:

- `DATABASE_URL` es la conexión usada por la aplicación.
- `DIRECT_URL` se usa para migraciones Prisma cuando el proveedor lo requiere.

## Desarrollo local

```bash
npm install
npm run prisma:sync
npm run dev
```

La aplicación quedará en `http://localhost:3000`.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Configura `DATABASE_URL` y `DIRECT_URL` en el panel de variables de entorno.
4. Usa `npm run vercel-build` como comando de build si quieres dejarlo explícito.
5. Ejecuta `npm run prisma:migrate:deploy` sobre la base productiva cuando trabajes con migraciones versionadas.

## Base de datos

El proyecto ya no está orientado a SQLite local como infraestructura principal.

La base recomendada es PostgreSQL alojado, por ejemplo:

- Neon
- Supabase Postgres
- Railway Postgres
- PostgreSQL administrado propio

## CSV de establecimientos

El directorio base sigue cargándose desde `public/formacion_directorio_territorio.csv` y se sincroniza automáticamente con la base de datos al iniciar la aplicación.

La importación manual sigue aceptando columnas como:

- `nombre`
- `name`
- `colegio`
- `establecimiento`

Ejemplo:

```csv
nombre,comuna
Colegio San Alberto,Santiago
Escuela Básica Norte,Puente Alto
Liceo Politécnico Sur,La Florida
```

## Nota sobre Electron

La configuración de Electron todavía existe en el repositorio como legado, pero la infraestructura objetivo del proyecto ahora es web sobre Vercel + PostgreSQL.
# fixture
