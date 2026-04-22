import { getMatchIncidentLabel, getMatchStatusPresentation } from "@/features/fixture/domain/match-lifecycle";
import { getTournamentDetail } from "@/features/tournaments/application/tournament-service";

type ExportMatch = {
  id: string;
  phaseLabel: string | null;
  homeTeam: string;
  awayTeam: string;
  score: string;
  location: string;
  dateLabel: string;
  isFinished: boolean;
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

function formatDateLabel(date: string | null) {
  if (!date) {
    return "Por definir";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
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
  let tournament: Awaited<ReturnType<typeof getTournamentDetail>>;

  try {
    tournament = await getTournamentDetail(tournamentId);
  } catch {
    return null;
  }

  const groupsMap = new Map<string, ExportMatch[]>();

  for (const match of tournament.matches) {
    const groupTitle = getGroupTitle(match);
    const groupMatches = groupsMap.get(groupTitle) ?? [];
    const placeholderSides = getPlaceholderSides(match.matchLogicIdentifier);

    groupMatches.push({
      id: match.id,
      phaseLabel: getPhaseLabel(match.matchLogicIdentifier),
      homeTeam: match.homeTeam?.name ?? placeholderSides?.home ?? "BYE",
      awayTeam: match.awayTeam?.name ?? placeholderSides?.away ?? "BYE",
      score: match.isFinished ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : "Pendiente",
      location: match.location ?? "Por definir",
      dateLabel: formatDateLabel(match.date),
      isFinished: match.isFinished,
      statusLabel: getMatchStatusPresentation(match.status).label,
      incidentLabel: match.incidentType ? getMatchIncidentLabel(match.incidentType) : null,
      incidentNotes: match.incidentNotes,
    });

    groupsMap.set(groupTitle, groupMatches);
  }

  return {
    id: tournament.id,
    name: tournament.name,
    discipline: tournament.discipline.name,
    category: `${tournament.category.name} (${tournament.category.gender})`,
    format: tournament.format ?? "Sin definir",
    status: tournament.status,
    teamsCount: tournament.teams.length,
    matchesCount: tournament.matches.length,
    groups: Array.from(groupsMap.entries()).map(([title, matches]) => ({ title, matches })),
  };
}