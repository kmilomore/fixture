-- Importa el CSV base de establecimientos a PostgreSQL.
-- Ejecutar desde la raíz del proyecto con psql para que la ruta relativa del CSV funcione.
--
-- Ejemplo:
-- psql "postgresql://camilose:Alonsito2019@127.0.0.200:5432/camilose_deporte?schema=public" -f scripts/import-establishments-postgres.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;

DROP TABLE IF EXISTS _establishment_import;

CREATE TEMP TABLE _establishment_import (
  csv_id text,
  colegio text,
  colegio_normalized text,
  comuna text,
  dependencia text,
  director text,
  correo_electronico text,
  correo text,
  telefono text,
  created_at text,
  updated_at text
);

\copy _establishment_import (
  csv_id,
  colegio,
  colegio_normalized,
  comuna,
  dependencia,
  director,
  correo_electronico,
  correo,
  telefono,
  created_at,
  updated_at
) FROM './public/formacion_directorio_territorio.csv' WITH (
  FORMAT csv,
  HEADER true,
  ENCODING 'UTF8'
);

WITH cleaned AS (
  SELECT DISTINCT ON (normalized_name)
    trim(colegio) AS name,
    NULLIF(trim(comuna), '') AS comuna,
    trim(colegio_normalized) AS normalized_name,
    COALESCE(NULLIF(trim(created_at), '')::timestamp, NOW()) AS created_at,
    COALESCE(NULLIF(trim(updated_at), '')::timestamp, NOW()) AS updated_at
  FROM _establishment_import
  WHERE NULLIF(trim(colegio), '') IS NOT NULL
    AND upper(trim(colegio)) <> 'COLEGIO'
    AND COALESCE(upper(trim(comuna)), '') <> 'COMUNA'
    AND NULLIF(trim(colegio_normalized), '') IS NOT NULL
  ORDER BY normalized_name, created_at
)
INSERT INTO "Establishment" (
  "id",
  "name",
  "comuna",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  cleaned.name,
  cleaned.comuna,
  cleaned.created_at,
  cleaned.updated_at
FROM cleaned
WHERE NOT EXISTS (
  SELECT 1
  FROM "Establishment" existing
  WHERE trim(regexp_replace(upper(unaccent(existing."name")), '[^A-Z0-9]+', ' ', 'g')) = cleaned.normalized_name
);

INSERT INTO "Team" (
  "id",
  "name",
  "establishmentId",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  establishment."name",
  establishment."id",
  NOW(),
  NOW()
FROM "Establishment" establishment
WHERE NOT EXISTS (
  SELECT 1
  FROM "Team" team
  WHERE team."establishmentId" = establishment."id"
    AND trim(regexp_replace(upper(unaccent(team."name")), '[^A-Z0-9]+', ' ', 'g')) =
        trim(regexp_replace(upper(unaccent(establishment."name")), '[^A-Z0-9]+', ' ', 'g'))
);

COMMIT;

SELECT COUNT(*) AS establishments_total FROM "Establishment";
SELECT COUNT(*) AS teams_total FROM "Team";