import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";

const INPUT_CSV = path.join(process.cwd(), "public", "formacion_directorio_territorio.csv");
const OUTPUT_SQL = path.join(process.cwd(), "scripts", "import-establishments-phppgadmin.sql");

const DEFAULT_DISCIPLINES = [
  "Fútbol",
  "Básquetbol",
  "Vóleibol",
  "Balonmano",
];

const DEFAULT_CATEGORIES = [
  { name: "Sub-14", gender: "Mixto" },
  { name: "Sub-17", gender: "Mixto" },
  { name: "Sub-18", gender: "Mixto" },
];

function escapeSql(value) {
  return value.replace(/'/g, "''");
}

function normalizeName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function resolveName(row) {
  return (row.colegio ?? row.nombre ?? row.name ?? row.establecimiento ?? "").trim();
}

function resolveComuna(row) {
  const comuna = (row.comuna ?? "").trim();
  return comuna || null;
}

function buildDisciplinesSql() {
  return DEFAULT_DISCIPLINES.map(
    (name) => `INSERT INTO "Discipline" ("id", "name", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), '${escapeSql(name)}', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Discipline" WHERE upper("name") = upper('${escapeSql(name)}')
);`
  ).join("\n\n").replaceAll('INSERT INTO "Discipline"', 'INSERT INTO public."Discipline"');
}

function buildCategoriesSql() {
  return DEFAULT_CATEGORIES.map(
    ({ name, gender }) => `INSERT INTO "Category" ("id", "name", "gender", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), '${escapeSql(name)}', '${escapeSql(gender)}', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Category"
  WHERE upper("name") = upper('${escapeSql(name)}')
    AND upper("gender") = upper('${escapeSql(gender)}')
);`
  ).join("\n\n").replaceAll('INSERT INTO "Category"', 'INSERT INTO public."Category"');
}

async function main() {
  const csvContent = await readFile(INPUT_CSV, "utf8");
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const seen = new Set();
  const rows = [];

  for (const row of parsed.data) {
    const name = resolveName(row);
    const comuna = resolveComuna(row);

    if (!name || name.toUpperCase() === "COLEGIO") {
      continue;
    }

    const normalized = normalizeName(row.colegio_normalized?.trim() || name);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    if (comuna && comuna.toUpperCase() === "COMUNA") {
      continue;
    }

    seen.add(normalized);
    rows.push({ name, comuna });
  }

  const establishmentsSql = rows.map(({ name, comuna }) => {
    const comunaValue = comuna ? `'${escapeSql(comuna)}'` : "NULL";
    return `INSERT INTO public."Establishment" ("id", "name", "comuna", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), '${escapeSql(name)}', ${comunaValue}, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public."Establishment" WHERE upper("name") = upper('${escapeSql(name)}')
);`;
  }).join("\n\n");

  const teamsSql = rows.map(({ name }) => `INSERT INTO public."Team" ("id", "name", "establishmentId", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), e."name", e."id", NOW(), NOW()
FROM public."Establishment" e
WHERE upper(e."name") = upper('${escapeSql(name)}')
  AND NOT EXISTS (
    SELECT 1 FROM public."Team" t
    WHERE t."establishmentId" = e."id"
      AND upper(t."name") = upper(e."name")
  );`).join("\n\n");

  const sql = `${buildDisciplinesSql()}

${buildCategoriesSql()}

${establishmentsSql}

${teamsSql}

SELECT COUNT(*) AS establishments_total FROM public."Establishment";
SELECT COUNT(*) AS teams_total FROM public."Team";
SELECT COUNT(*) AS disciplines_total FROM public."Discipline";
SELECT COUNT(*) AS categories_total FROM public."Category";
`;

  await writeFile(OUTPUT_SQL, sql, "utf8");
  console.log(`Generated ${OUTPUT_SQL} with ${rows.length} establishments.`);
}

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});