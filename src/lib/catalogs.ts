import postgres from "@/lib/postgres";

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
    postgres.query<{ id: string; name: string }>(
      'SELECT "id", "name" FROM public."Discipline"'
    ),
    postgres.query<{ id: string; name: string; gender: string }>(
      'SELECT "id", "name", "gender" FROM public."Category"'
    ),
  ]);

  const existingDisciplineNames = new Set(
    disciplines.rows.map((discipline) => normalizeCatalogName(discipline.name))
  );
  const existingCategoryKeys = new Set(
    categories.rows.map((category) => buildCategoryKey(category.name, category.gender))
  );

  const missingDisciplines = DEFAULT_DISCIPLINES.filter(
    (name) => !existingDisciplineNames.has(normalizeCatalogName(name))
  );
  const missingCategories = DEFAULT_CATEGORIES.filter(
    (category) => !existingCategoryKeys.has(buildCategoryKey(category.name, category.gender))
  );

  if (missingDisciplines.length > 0) {
    for (const name of missingDisciplines) {
      await postgres.query(
        'INSERT INTO public."Discipline" ("id", "name") VALUES ($1, $2)',
        [crypto.randomUUID(), name]
      );
    }
  }

  if (missingCategories.length > 0) {
    for (const category of missingCategories) {
      await postgres.query(
        'INSERT INTO public."Category" ("id", "name", "gender") VALUES ($1, $2, $3)',
        [crypto.randomUUID(), category.name, category.gender]
      );
    }
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