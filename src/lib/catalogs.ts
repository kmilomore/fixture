import prisma from "@/lib/prisma";

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

declare global {
  var catalogsSyncPromise:
    | Promise<void>
    | undefined;
}

export function normalizeCatalogName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildCategoryKey(name: string, gender: string) {
  return `${normalizeCatalogName(name)}:${normalizeCatalogName(gender)}`;
}

async function runCatalogsSync() {
  const [disciplines, categories] = await Promise.all([
    prisma.discipline.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true, gender: true } }),
  ]);

  const existingDisciplineNames = new Set(
    disciplines.map((discipline) => normalizeCatalogName(discipline.name))
  );
  const existingCategoryKeys = new Set(
    categories.map((category) => buildCategoryKey(category.name, category.gender))
  );

  const missingDisciplines = DEFAULT_DISCIPLINES.filter(
    (name) => !existingDisciplineNames.has(normalizeCatalogName(name))
  );
  const missingCategories = DEFAULT_CATEGORIES.filter(
    (category) => !existingCategoryKeys.has(buildCategoryKey(category.name, category.gender))
  );

  if (missingDisciplines.length > 0) {
    await prisma.discipline.createMany({
      data: missingDisciplines.map((name) => ({ name })),
    });
  }

  if (missingCategories.length > 0) {
    await prisma.category.createMany({
      data: missingCategories,
    });
  }
}

export async function ensureDefaultCatalogsLoaded() {
  if (!globalThis.catalogsSyncPromise) {
    globalThis.catalogsSyncPromise = runCatalogsSync().finally(() => {
      globalThis.catalogsSyncPromise = undefined;
    });
  }

  await globalThis.catalogsSyncPromise;
}