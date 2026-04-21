import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

function normalizeValue(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeComuna(value) {
  const comuna = value?.trim();
  return comuna ? comuna : null;
}

function pickName(row) {
  return (row.colegio ?? row.nombre ?? row.name ?? row.establecimiento ?? "").trim();
}

function pickNormalizedName(row, name) {
  return (row.colegio_normalized ?? "").trim() || normalizeValue(name).toUpperCase();
}

function dedupeRows(rows) {
  const seen = new Set();
  const uniqueRows = [];

  for (const row of rows) {
    const name = pickName(row);
    if (!name || name.toUpperCase() === "COLEGIO") {
      continue;
    }

    const normalizedName = pickNormalizedName(row, name);
    if (!normalizedName || seen.has(normalizedName)) {
      continue;
    }

    seen.add(normalizedName);
    uniqueRows.push({
      name,
      comuna: normalizeComuna(row.comuna),
      normalizedName,
    });
  }

  return uniqueRows;
}

async function ensureDefaultCatalogs() {
  const [disciplines, categories] = await Promise.all([
    prisma.discipline.findMany({ select: { name: true } }),
    prisma.category.findMany({ select: { name: true, gender: true } }),
  ]);

  const existingDisciplineNames = new Set(disciplines.map((item) => normalizeValue(item.name)));
  const existingCategoryKeys = new Set(
    categories.map((item) => `${normalizeValue(item.name)}:${normalizeValue(item.gender)}`)
  );

  const missingDisciplines = DEFAULT_DISCIPLINES.filter(
    (name) => !existingDisciplineNames.has(normalizeValue(name))
  );
  const missingCategories = DEFAULT_CATEGORIES.filter(
    (item) => !existingCategoryKeys.has(`${normalizeValue(item.name)}:${normalizeValue(item.gender)}`)
  );

  if (missingDisciplines.length > 0) {
    await prisma.discipline.createMany({
      data: missingDisciplines.map((name) => ({ name })),
    });
  }

  if (missingCategories.length > 0) {
    await prisma.category.createMany({ data: missingCategories });
  }

  return {
    insertedDisciplines: missingDisciplines.length,
    insertedCategories: missingCategories.length,
  };
}

async function importEstablishmentsFromCsv() {
  const csvPath = path.join(process.cwd(), "public", "formacion_directorio_territorio.csv");
  const csvContent = await readFile(csvPath, "utf8");
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV parse warnings:", parsed.errors.slice(0, 5));
  }

  const rows = dedupeRows(parsed.data);
  const establishments = await prisma.establishment.findMany({
    select: { id: true, name: true, comuna: true },
  });

  const existingByName = new Map(
    establishments.map((item) => [normalizeValue(item.name), item])
  );

  let insertedEstablishments = 0;
  let updatedComunas = 0;

  for (const row of rows) {
    const existing = existingByName.get(normalizeValue(row.name));

    if (!existing) {
      const created = await prisma.establishment.create({
        data: {
          name: row.name,
          comuna: row.comuna,
        },
      });

      existingByName.set(normalizeValue(created.name), created);
      insertedEstablishments += 1;
      continue;
    }

    if (!existing.comuna && row.comuna) {
      await prisma.establishment.update({
        where: { id: existing.id },
        data: { comuna: row.comuna },
      });
      updatedComunas += 1;
    }
  }

  const allEstablishments = await prisma.establishment.findMany({
    select: { id: true, name: true },
  });
  const existingTeams = await prisma.team.findMany({
    select: { name: true, establishmentId: true },
  });

  const existingTeamKeys = new Set(
    existingTeams.map((team) => `${team.establishmentId}:${normalizeValue(team.name)}`)
  );

  const missingTeams = allEstablishments.filter((establishment) => {
    const key = `${establishment.id}:${normalizeValue(establishment.name)}`;
    return !existingTeamKeys.has(key);
  });

  if (missingTeams.length > 0) {
    await prisma.team.createMany({
      data: missingTeams.map((establishment) => ({
        name: establishment.name,
        establishmentId: establishment.id,
      })),
    });
  }

  return {
    csvRows: rows.length,
    insertedEstablishments,
    updatedComunas,
    insertedTeams: missingTeams.length,
  };
}

async function main() {
  const catalogStats = await ensureDefaultCatalogs();
  const establishmentStats = await importEstablishmentsFromCsv();

  console.log(
    JSON.stringify(
      {
        ok: true,
        ...catalogStats,
        ...establishmentStats,
      },
      null,
      2
    )
  );
}

await main()
  .catch((error) => {
    console.error("Import failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });