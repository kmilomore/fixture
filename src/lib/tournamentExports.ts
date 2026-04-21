import postgres from "@/lib/postgres";
import type { MatchIncidentType, MatchStatus } from "@/lib/matchLifecycle";
import { getMatchIncidentLabel, getMatchStatusPresentation } from "@/lib/matchLifecycle";

type ExportMatch = {
  id: string;
  phaseLabel: string | null;
  homeTeam: string;
  awayTeam: string;
  score: string;
  location: string;
  dateLabel: string;
  isFinished: boolean;
  status: MatchStatus;
  statusLabel: string;
  incidentLabel: string | null;
  incidentNotes: string | null;
};

type ExportGroup = {
  title: string;
  matches: ExportMatch[];
};

function getPlaceholderSides(matchLogicIdentifier: string | null) {
  if (!matchLogicIdentifier || !matchLogicIdentifier.includes(" vs ")) {
    return null;
  }

  const [home, away] = matchLogicIdentifier.split(" vs ");
  return { home, away };
}

export type TournamentFixtureExportData = {
  id: string;
  name: string;
  discipline: string;
  category: string;
  format: string;
  status: string;
  teamsCount: number;
  matchesCount: number;
  groups: ExportGroup[];
};

function getGroupTitle(match: {
  groupName: string | null;
  matchLogicIdentifier: string | null;
  round: number | null;
}) {
  return match.groupName || match.matchLogicIdentifier || `Ronda ${match.round ?? "-"}`;
}

function getPhaseLabel(matchLogicIdentifier: string | null) {
  if (!matchLogicIdentifier || matchLogicIdentifier.includes(" vs ")) {
    return null;
  }

  return matchLogicIdentifier;
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return "Por definir";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function buildTournamentExportFileName(name: string, extension: "pdf" | "xlsx") {
  const safeName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `fixture-${safeName || "torneo"}.${extension}`;
}

export async function getTournamentFixtureExportData(tournamentId: string): Promise<TournamentFixtureExportData | null> {
  const [tournamentResult, matchesResult] = await Promise.all([
    postgres.query<{
      id: string;
      name: string;
      disciplineName: string;
      categoryName: string;
      categoryGender: string;
      format: string | null;
      status: string;
      teamsCount: number;
    }>(
      `SELECT t."id", t."name", t."format", t."status",
         d."name" AS "disciplineName",
         c."name" AS "categoryName",
         c."gender" AS "categoryGender",
         COUNT(DISTINCT tt."id")::int AS "teamsCount"
       FROM public."Tournament" t
       INNER JOIN public."Discipline" d ON d."id" = t."disciplineId"
       INNER JOIN public."Category" c ON c."id" = t."categoryId"
       LEFT JOIN public."TournamentTeam" tt ON tt."tournamentId" = t."id"
       WHERE t."id" = $1
       GROUP BY t."id", d."id", c."id"`,
      [tournamentId]
    ),
    postgres.query<{
      id: string;
      round: number | null;
      groupName: string | null;
      matchLogicIdentifier: string | null;
      date: Date | null;
      location: string | null;
      homeScore: number | null;
      awayScore: number | null;
      isFinished: boolean;
      status: MatchStatus;
      incidentType: MatchIncidentType | null;
      incidentNotes: string | null;
      homeTeamName: string | null;
      awayTeamName: string | null;
    }>(
      `SELECT m."id", m."round", m."groupName", m."matchLogicIdentifier", m."date", m."location", m."homeScore", m."awayScore", m."isFinished", m."status", m."incidentType", m."incidentNotes",
         ht."name" AS "homeTeamName",
         at."name" AS "awayTeamName"
       FROM public."Match" m
       LEFT JOIN public."Team" ht ON ht."id" = m."homeTeamId"
       LEFT JOIN public."Team" at ON at."id" = m."awayTeamId"
       WHERE m."tournamentId" = $1
       ORDER BY m."round" ASC NULLS LAST, m."createdAt" ASC`,
      [tournamentId]
    ),
  ]);

  if (tournamentResult.rowCount === 0) {
    return null;
  }

  const tournament = tournamentResult.rows[0];

  const groupsMap = new Map<string, ExportMatch[]>();

  for (const match of matchesResult.rows) {
    const groupTitle = getGroupTitle(match);
    const groupMatches = groupsMap.get(groupTitle) ?? [];
    const placeholderSides = getPlaceholderSides(match.matchLogicIdentifier);

    groupMatches.push({
      id: match.id,
      phaseLabel: getPhaseLabel(match.matchLogicIdentifier),
      homeTeam: match.homeTeamName ?? placeholderSides?.home ?? "BYE",
      awayTeam: match.awayTeamName ?? placeholderSides?.away ?? "BYE",
      score: match.isFinished ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : "Pendiente",
      location: match.location ?? "Por definir",
      dateLabel: formatDateLabel(match.date),
      isFinished: match.isFinished,
      status: match.status,
      statusLabel: getMatchStatusPresentation(match.status).label,
      incidentLabel: match.incidentType ? getMatchIncidentLabel(match.incidentType) : null,
      incidentNotes: match.incidentNotes,
    });

    groupsMap.set(groupTitle, groupMatches);
  }

  return {
    id: tournament.id,
    name: tournament.name,
    discipline: tournament.disciplineName,
    category: `${tournament.categoryName} (${tournament.categoryGender})`,
    format: tournament.format ?? "Sin definir",
    status: tournament.status,
    teamsCount: tournament.teamsCount,
    matchesCount: matchesResult.rowCount ?? 0,
    groups: Array.from(groupsMap.entries()).map(([title, matches]) => ({ title, matches })),
  };
}