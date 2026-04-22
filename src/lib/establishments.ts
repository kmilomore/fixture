import { promises as fs } from "fs";
import path from "path";
import type { PoolClient } from "pg";
import Papa from "papaparse";
import postgres from "@/lib/postgres";
import {
  normalizeComuna,
  normalizeEstablishmentName,
} from "@/features/establishments/domain/establishment-normalization";

const DEFAULT_ESTABLISHMENTS_CSV = "formacion_directorio_territorio.csv";

type CsvRow = Record<string, string | null | undefined>;
type EstablishmentImportRow = {
  name: string;
  comuna: string | null;
};

type EstablishmentRow = {
  id: string;
  name: string;
  comuna: string | null;
  createdAt: Date;
};

type TeamRow = {
  id: string;
  name: string;
  establishmentId: string;
  createdAt: Date;
  updatedAt: Date;
};

type TournamentTeamRow = {
  id: string;
  tournamentId: string;
  teamId: string;
};

declare global {
  var establishmentSyncPromise:
    | Promise<void>
    | undefined;
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
  return;
}

async function mergeTournamentTeams(
  client: PoolClient,
  duplicateTeamId: string,
  canonicalTeamId: string
) {
  const duplicateTournamentTeams = await client.query<TournamentTeamRow>(
    'SELECT "id", "tournamentId", "teamId" FROM public."TournamentTeam" WHERE "teamId" = $1',
    [duplicateTeamId]
  );

  for (const tournamentTeam of duplicateTournamentTeams.rows) {
    const existing = await client.query<{ id: string }>(
      'SELECT "id" FROM public."TournamentTeam" WHERE "tournamentId" = $1 AND "teamId" = $2 LIMIT 1',
      [tournamentTeam.tournamentId, canonicalTeamId]
    );

    if (existing.rows.length > 0) {
      await client.query('DELETE FROM public."TournamentTeam" WHERE "id" = $1', [tournamentTeam.id]);
      continue;
    }

    await client.query(
      'UPDATE public."TournamentTeam" SET "teamId" = $2 WHERE "id" = $1',
      [tournamentTeam.id, canonicalTeamId]
    );
  }
}

async function mergeTeamIntoCanonical(
  client: PoolClient,
  duplicateTeamId: string,
  canonicalTeamId: string
) {
  if (duplicateTeamId === canonicalTeamId) {
    return;
  }

  await mergeTournamentTeams(client, duplicateTeamId, canonicalTeamId);
  await client.query(
    'UPDATE public."Match" SET "homeTeamId" = $2 WHERE "homeTeamId" = $1',
    [duplicateTeamId, canonicalTeamId]
  );
  await client.query(
    'UPDATE public."Match" SET "awayTeamId" = $2 WHERE "awayTeamId" = $1',
    [duplicateTeamId, canonicalTeamId]
  );
  await client.query('DELETE FROM public."Team" WHERE "id" = $1', [duplicateTeamId]);
}

export async function mergeDuplicateEstablishments() {
  const client = await postgres.connect();

  try {
    await client.query("BEGIN");

    const [establishmentsResult, teamsResult] = await Promise.all([
      client.query<EstablishmentRow>(
        'SELECT "id", "name", "comuna", "createdAt" FROM public."Establishment" ORDER BY "createdAt" ASC'
      ),
      client.query<TeamRow>(
        'SELECT "id", "name", "establishmentId", "createdAt", "updatedAt" FROM public."Team" ORDER BY "createdAt" ASC'
      ),
    ]);

    const teamsByEstablishmentId = new Map<string, TeamRow[]>();
    for (const team of teamsResult.rows) {
      const group = teamsByEstablishmentId.get(team.establishmentId) ?? [];
      group.push(team);
      teamsByEstablishmentId.set(team.establishmentId, group);
    }

    const establishments = establishmentsResult.rows.map((establishment) => ({
      ...establishment,
      teams: teamsByEstablishmentId.get(establishment.id) ?? [],
    }));

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
            await mergeTeamIntoCanonical(client, team.id, canonicalTeam.id);
            continue;
          }

          await client.query(
            'UPDATE public."Team" SET "establishmentId" = $2 WHERE "id" = $1',
            [team.id, canonical.id]
          );

          canonicalTeams.set(normalizedTeamName, {
            ...team,
            establishmentId: canonical.id,
          });
        }

        await client.query('DELETE FROM public."Establishment" WHERE "id" = $1', [duplicate.id]);
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function runEstablishmentSync() {
  await ensureEstablishmentSchema();
  await mergeDuplicateEstablishments();

  const defaultRows = await loadDefaultEstablishments();
  if (defaultRows.length === 0) {
    return;
  }

  const existingEstablishments = await postgres.query<{
    id: string;
    name: string;
    comuna: string | null;
  }>('SELECT "id", "name", "comuna" FROM public."Establishment"');
  const existingByName = new Map(
    existingEstablishments.rows.map((item) => [normalizeEstablishmentName(item.name), item])
  );

  const missingRows = defaultRows.filter((row) => !existingByName.has(normalizeEstablishmentName(row.name)));
  const rowsToUpdate = defaultRows.filter((row) => {
    const existing = existingByName.get(normalizeEstablishmentName(row.name));
    return existing && !existing.comuna && row.comuna;
  });

  if (missingRows.length > 0) {
    for (const row of missingRows) {
      await postgres.query(
        'INSERT INTO public."Establishment" ("id", "name", "comuna") VALUES ($1, $2, $3)',
        [crypto.randomUUID(), row.name, row.comuna]
      );
    }
  }

  for (const row of rowsToUpdate) {
    const existing = existingByName.get(normalizeEstablishmentName(row.name));
    if (!existing) {
      continue;
    }

    await postgres.query(
      'UPDATE public."Establishment" SET "comuna" = $2 WHERE "id" = $1',
      [existing.id, row.comuna]
    );
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
  const establishments = await postgres.query<{ name: string }>(
    'SELECT "name" FROM public."Establishment"'
  );

  return new Set(establishments.rows.map((item) => normalizeEstablishmentName(item.name)));
}

export async function ensureTeamsMatchEstablishments() {
  const [establishments, teams] = await Promise.all([
    postgres.query<{ id: string; name: string }>(
      'SELECT "id", "name" FROM public."Establishment"'
    ),
    postgres.query<{ name: string; establishmentId: string }>(
      'SELECT "name", "establishmentId" FROM public."Team"'
    ),
  ]);

  const existingTeamKeys = new Set(
    teams.rows.map((team) => `${team.establishmentId}:${normalizeEstablishmentName(team.name)}`)
  );

  const missingTeams = establishments.rows.filter((establishment) => {
    const teamKey = `${establishment.id}:${normalizeEstablishmentName(establishment.name)}`;
    return !existingTeamKeys.has(teamKey);
  });

  if (missingTeams.length === 0) {
    return;
  }

  for (const establishment of missingTeams) {
    await postgres.query(
      'INSERT INTO public."Team" ("id", "name", "establishmentId") VALUES ($1, $2, $3)',
      [crypto.randomUUID(), establishment.name, establishment.id]
    );
  }
}