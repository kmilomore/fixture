import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";
import prisma from "@/lib/prisma";

const DEFAULT_ESTABLISHMENTS_CSV = "formacion_directorio_territorio.csv";

type CsvRow = Record<string, string | null | undefined>;
type EstablishmentImportRow = {
  name: string;
  comuna: string | null;
};

type SqliteColumnInfo = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
};

declare global {
  var establishmentSyncPromise:
    | Promise<void>
    | undefined;
}

function isSqliteDatabase() {
  return process.env.DATABASE_URL?.startsWith("file:") ?? false;
}

export function normalizeEstablishmentName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function dedupeEstablishmentNames(names: string[]) {
  const seen = new Set<string>();
  const uniqueNames: string[] = [];

  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) {
      continue;
    }

    const normalized = normalizeEstablishmentName(name);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    uniqueNames.push(name);
  }

  return uniqueNames;
}

export function normalizeComuna(value: string | null | undefined) {
  const comuna = value?.trim();
  return comuna ? comuna : null;
}

function chooseCanonicalEstablishment<T extends { comuna: string | null; createdAt: Date; id: string }>(
  establishments: T[]
) {
  return [...establishments].sort((left, right) => {
    const comunaScore = Number(Boolean(right.comuna)) - Number(Boolean(left.comuna));
    if (comunaScore !== 0) {
      return comunaScore;
    }

    const createdAtScore = left.createdAt.getTime() - right.createdAt.getTime();
    if (createdAtScore !== 0) {
      return createdAtScore;
    }

    return left.id.localeCompare(right.id);
  })[0];
}

function resolveCsvName(row: CsvRow) {
  return (row.colegio ?? row.name ?? row.nombre ?? row.establecimiento ?? "").trim();
}

function resolveCsvComuna(row: CsvRow) {
  return normalizeComuna(row.comuna ?? row.municipio ?? row.ciudad ?? null);
}

export function dedupeEstablishmentRows(rows: EstablishmentImportRow[]) {
  const seen = new Set<string>();
  const uniqueRows: EstablishmentImportRow[] = [];

  for (const row of rows) {
    const normalized = normalizeEstablishmentName(row.name);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    uniqueRows.push({
      name: row.name.trim(),
      comuna: normalizeComuna(row.comuna),
    });
  }

  return uniqueRows;
}

async function loadDefaultEstablishments() {
  const csvPath = path.join(process.cwd(), "public", DEFAULT_ESTABLISHMENTS_CSV);
  const csvContent = await fs.readFile(csvPath, "utf8");
  const parsed = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn("Errores leyendo CSV de establecimientos por defecto:", parsed.errors);
  }

  const rows = parsed.data
    .map((row) => ({
      name: resolveCsvName(row),
      comuna: resolveCsvComuna(row),
    }))
    .filter((row) => row.name);

  return dedupeEstablishmentRows(rows);
}

async function ensureEstablishmentSchema() {
  if (!isSqliteDatabase()) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<SqliteColumnInfo[]>(
    'PRAGMA table_info("Establishment")'
  );

  const hasComuna = columns.some((column) => column.name === "comuna");

  if (!hasComuna) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Establishment" ADD COLUMN "comuna" TEXT'
    );
  }
}

async function mergeTournamentTeams(duplicateTeamId: string, canonicalTeamId: string) {
  const duplicateTournamentTeams = await prisma.tournamentTeam.findMany({
    where: { teamId: duplicateTeamId },
  });

  for (const tournamentTeam of duplicateTournamentTeams) {
    const existing = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId: tournamentTeam.tournamentId,
        teamId: canonicalTeamId,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.tournamentTeam.delete({ where: { id: tournamentTeam.id } });
      continue;
    }

    await prisma.tournamentTeam.update({
      where: { id: tournamentTeam.id },
      data: { teamId: canonicalTeamId },
    });
  }
}

async function mergeTeamIntoCanonical(duplicateTeamId: string, canonicalTeamId: string) {
  if (duplicateTeamId === canonicalTeamId) {
    return;
  }

  await mergeTournamentTeams(duplicateTeamId, canonicalTeamId);
  await prisma.match.updateMany({
    where: { homeTeamId: duplicateTeamId },
    data: { homeTeamId: canonicalTeamId },
  });
  await prisma.match.updateMany({
    where: { awayTeamId: duplicateTeamId },
    data: { awayTeamId: canonicalTeamId },
  });
  await prisma.team.delete({ where: { id: duplicateTeamId } });
}

export async function mergeDuplicateEstablishments() {
  const establishments = await prisma.establishment.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const groups = new Map<string, typeof establishments>();

  for (const establishment of establishments) {
    const normalizedName = normalizeEstablishmentName(establishment.name);
    const group = groups.get(normalizedName) ?? [];
    group.push(establishment);
    groups.set(normalizedName, group);
  }

  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }

    const canonical = chooseCanonicalEstablishment(group);
    const canonicalTeams = new Map(
      canonical.teams.map((team) => [normalizeEstablishmentName(team.name), team])
    );

    for (const duplicate of group) {
      if (duplicate.id === canonical.id) {
        continue;
      }

      for (const team of duplicate.teams) {
        const normalizedTeamName = normalizeEstablishmentName(team.name);
        const canonicalTeam = canonicalTeams.get(normalizedTeamName);

        if (canonicalTeam) {
          await mergeTeamIntoCanonical(team.id, canonicalTeam.id);
          continue;
        }

        const movedTeam = await prisma.team.update({
          where: { id: team.id },
          data: { establishmentId: canonical.id },
        });

        canonicalTeams.set(normalizedTeamName, movedTeam);
      }

      await prisma.establishment.delete({ where: { id: duplicate.id } });
    }
  }
}

async function runEstablishmentSync() {
  await ensureEstablishmentSchema();
  await mergeDuplicateEstablishments();

  const defaultRows = await loadDefaultEstablishments();
  if (defaultRows.length === 0) {
    return;
  }

  const existingEstablishments = await prisma.establishment.findMany({
    select: { id: true, name: true, comuna: true },
  });
  const existingByName = new Map(
    existingEstablishments.map((item) => [normalizeEstablishmentName(item.name), item])
  );

  const missingRows = defaultRows.filter((row) => !existingByName.has(normalizeEstablishmentName(row.name)));
  const rowsToUpdate = defaultRows.filter((row) => {
    const existing = existingByName.get(normalizeEstablishmentName(row.name));
    return existing && !existing.comuna && row.comuna;
  });

  if (missingRows.length > 0) {
    await prisma.establishment.createMany({
      data: missingRows.map((row) => ({
        name: row.name,
        comuna: row.comuna,
      })),
    });
  }

  for (const row of rowsToUpdate) {
    const existing = existingByName.get(normalizeEstablishmentName(row.name));
    if (!existing) {
      continue;
    }

    await prisma.establishment.update({
      where: { id: existing.id },
      data: { comuna: row.comuna },
    });
  }

  await ensureTeamsMatchEstablishments();
}

export async function ensureDefaultEstablishmentsLoaded() {
  if (!globalThis.establishmentSyncPromise) {
    globalThis.establishmentSyncPromise = runEstablishmentSync().finally(() => {
      globalThis.establishmentSyncPromise = undefined;
    });
  }

  await globalThis.establishmentSyncPromise;
}

export async function getExistingEstablishmentNameSet() {
  const establishments = await prisma.establishment.findMany({
    select: { name: true },
  });

  return new Set(establishments.map((item) => normalizeEstablishmentName(item.name)));
}

export async function ensureTeamsMatchEstablishments() {
  const establishments = await prisma.establishment.findMany({
    select: { id: true, name: true },
  });
  const teams = await prisma.team.findMany({
    select: { name: true, establishmentId: true },
  });

  const existingTeamKeys = new Set(
    teams.map((team) => `${team.establishmentId}:${normalizeEstablishmentName(team.name)}`)
  );

  const missingTeams = establishments.filter((establishment) => {
    const teamKey = `${establishment.id}:${normalizeEstablishmentName(establishment.name)}`;
    return !existingTeamKeys.has(teamKey);
  });

  if (missingTeams.length === 0) {
    return;
  }

  await prisma.team.createMany({
    data: missingTeams.map((establishment) => ({
      name: establishment.name,
      establishmentId: establishment.id,
    })),
  });
}