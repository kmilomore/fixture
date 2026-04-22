import { getSupabase } from "@/infrastructure/supabase/client";
import { buildAutomaticFixtureAssignments } from "@/features/fixture/domain/progression";
import { resolveFixtureFormat } from "@/features/fixture/domain/fixture-format";
import {
  isMatchIncidentType,
  normalizeMatchStatus,
  type MatchIncidentType,
  type MatchStatus,
} from "@/features/fixture/domain/match-lifecycle";
import {
  DEFAULT_SCHEDULING_RULES,
  canTransitionTournamentStatus,
  deriveTournamentStatus,
  isTournamentStatus,
  schedulingRulesFromRow,
  schedulingRulesToRow,
  type TournamentStatus,
} from "@/features/tournaments/domain/tournament-lifecycle";
import type { FixtureSchedulingRules } from "@/features/fixture/domain/fixture-engine";
import { ServiceError } from "@/shared/lib/service-error";

export type TournamentListItem = {
  id: string;
  name: string;
  format: string | null;
  status: TournamentStatus;
  schedulingRules: FixtureSchedulingRules;
  discipline: { id: string; name: string };
  category: { id: string; name: string; gender: string };
  teamsCount: number;
  matchesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TournamentTeamEntry = {
  id: string;
  tournamentId: string;
  teamId: string;
  team: {
    id: string;
    name: string;
    establishmentId: string;
    establishment: { id: string; name: string; comuna: string | null };
    createdAt: string;
    updatedAt: string;
  };
};

export type TournamentMatchEntry = {
  id: string;
  tournamentId: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  date: string | null;
  location: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  status: MatchStatus;
  incidentType: MatchIncidentType | null;
  incidentNotes: string | null;
  round: number | null;
  groupName: string | null;
  matchLogicIdentifier: string | null;
  createdAt: string;
  updatedAt: string;
  homeTeam: TournamentTeamEntry["team"] | null;
  awayTeam: TournamentTeamEntry["team"] | null;
};

export type TournamentDetail = {
  id: string;
  name: string;
  format: string | null;
  status: TournamentStatus;
  schedulingRules: FixtureSchedulingRules;
  createdAt: string;
  updatedAt: string;
  discipline: { id: string; name: string };
  category: { id: string; name: string; gender: string };
  teams: TournamentTeamEntry[];
  matches: TournamentMatchEntry[];
};

const TOURNAMENT_SELECT = "id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender), TournamentTeam(id), Match(id)";
const TOURNAMENT_LEGACY_SELECT = "id, name, format, status, createdAt, updatedAt, Discipline(id, name), Category(id, name, gender), TournamentTeam(id), Match(id)";
const TOURNAMENT_DETAIL_SELECT = "id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)";
const TOURNAMENT_DETAIL_LEGACY_SELECT = "id, name, format, status, createdAt, updatedAt, Discipline(id, name), Category(id, name, gender)";
const MATCH_DETAIL_SELECT = "id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, status, incidentType, incidentNotes, round, groupName, matchLogicIdentifier, createdAt, updatedAt";
const MATCH_DETAIL_LEGACY_SELECT = "id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, round, groupName, matchLogicIdentifier, createdAt, updatedAt";
const TOURNAMENT_TEAM_SELECT = "id, tournamentId, teamId, Team(id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna))";

function hasMissingTournamentColumns(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return false;
  }

  const message = String(error.message).toLowerCase();
  return (
    message.includes("schedulestartdate") ||
    message.includes("scheduleenddate") ||
    message.includes("schedulematchespermatchday") ||
    message.includes("incidenttype") ||
    message.includes("incidentnotes") ||
    message.includes("status")
  );
}

function mapTournamentTeamEntry(entry: {
  id: string;
  tournamentId: string;
  teamId: string;
  Team?: unknown;
}) {
  const team = entry.Team as
    | {
        id: string;
        name: string;
        establishmentId: string;
        createdAt: string;
        updatedAt: string;
        Establishment: { id: string; name: string; comuna: string | null } | null;
      }
    | null;

  return {
    id: entry.id,
    tournamentId: entry.tournamentId,
    teamId: entry.teamId,
    team: {
      id: team?.id ?? entry.teamId,
      name: team?.name ?? "",
      establishmentId: team?.establishmentId ?? "",
      establishment: {
        id: team?.Establishment?.id ?? "",
        name: team?.Establishment?.name ?? "",
        comuna: team?.Establishment?.comuna ?? null,
      },
      createdAt: team?.createdAt ?? "",
      updatedAt: team?.updatedAt ?? "",
    },
  } satisfies TournamentTeamEntry;
}

function buildTeamsMap(entries: Array<{ teamId: string; Team?: unknown }>) {
  const teamsMap = new Map<string, TournamentTeamEntry["team"]>();

  entries.forEach((entry) => {
    const mapped = mapTournamentTeamEntry({
      id: "",
      tournamentId: "",
      teamId: entry.teamId,
      Team: entry.Team,
    });
    teamsMap.set(entry.teamId, mapped.team);
  });

  return teamsMap;
}

export async function listTournaments(searchQuery = "") {
  const supabase = getSupabase();
  const q = searchQuery.trim();

  const buildQuery = (selectClause: string) => {
    let query = supabase.from("Tournament").select(selectClause).order("createdAt", { ascending: false });
    if (q) {
      query = query.ilike("name", `%${q}%`);
    }
    return query;
  };

  let { data, error } = await buildQuery(TOURNAMENT_SELECT);

  if (error && hasMissingTournamentColumns(error)) {
    const fallback = await buildQuery(TOURNAMENT_LEGACY_SELECT);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const tournamentRow = row as unknown as Record<string, unknown> & {
      id: string;
      name: string;
      format: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
      scheduleStartDate?: string | null;
      scheduleEndDate?: string | null;
      scheduleMatchesPerMatchday?: number | null;
      scheduleAllowedWeekdays?: number[] | null;
      scheduleDailyStartTime?: string | null;
      scheduleDailyEndTime?: string | null;
      scheduleMatchDurationMinutes?: number | null;
      Discipline?: unknown;
      Category?: unknown;
      TournamentTeam?: Array<unknown>;
      Match?: Array<unknown>;
    };
    const discipline = tournamentRow.Discipline as { id: string; name: string } | null;
    const category = tournamentRow.Category as { id: string; name: string; gender: string } | null;
    const normalizedStatus = isTournamentStatus(tournamentRow.status) ? tournamentRow.status : "DRAFT";

    return {
      id: tournamentRow.id,
      name: tournamentRow.name,
      format: tournamentRow.format,
      status: deriveTournamentStatus({
        teamCount: Array.isArray(tournamentRow.TournamentTeam) ? tournamentRow.TournamentTeam.length : 0,
        matchCount: Array.isArray(tournamentRow.Match) ? tournamentRow.Match.length : 0,
        format: tournamentRow.format,
        status: normalizedStatus,
      }),
      schedulingRules: schedulingRulesFromRow(tournamentRow),
      discipline: { id: discipline?.id ?? "", name: discipline?.name ?? "" },
      category: { id: category?.id ?? "", name: category?.name ?? "", gender: category?.gender ?? "" },
      teamsCount: Array.isArray(tournamentRow.TournamentTeam) ? tournamentRow.TournamentTeam.length : 0,
      matchesCount: Array.isArray(tournamentRow.Match) ? tournamentRow.Match.length : 0,
      createdAt: tournamentRow.createdAt,
      updatedAt: tournamentRow.updatedAt,
    } satisfies TournamentListItem;
  });
}

export async function createTournament(input: { name: string; disciplineId: string; categoryId: string }) {
  const supabase = getSupabase();
  const name = input.name.trim();
  const disciplineId = input.disciplineId.trim();
  const categoryId = input.categoryId.trim();

  if (!name || !disciplineId || !categoryId) {
    throw new ServiceError(400, "Nombre, disciplina y categoria son obligatorios");
  }

  const primaryInsert = await supabase
    .from("Tournament")
    .insert({ id: crypto.randomUUID(), name, disciplineId, categoryId, ...schedulingRulesToRow(DEFAULT_SCHEDULING_RULES) })
    .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)")
    .single();

  let data: unknown = primaryInsert.data;
  let error: unknown = primaryInsert.error;

  if (error && hasMissingTournamentColumns(error)) {
    const fallback = await supabase
      .from("Tournament")
      .insert({ id: crypto.randomUUID(), name, disciplineId, categoryId })
      .select("id, name, format, status, createdAt, updatedAt, Discipline(id, name), Category(id, name, gender)")
      .single();

    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    throw error;
  }

  const tournamentRow = data as unknown as Record<string, unknown> & {
    id: string;
    name: string;
    format: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    scheduleStartDate?: string | null;
    scheduleEndDate?: string | null;
    scheduleMatchesPerMatchday?: number | null;
    scheduleAllowedWeekdays?: number[] | null;
    scheduleDailyStartTime?: string | null;
    scheduleDailyEndTime?: string | null;
    scheduleMatchDurationMinutes?: number | null;
    Discipline?: unknown;
    Category?: unknown;
  };
  const discipline = tournamentRow.Discipline as { id: string; name: string } | null;
  const category = tournamentRow.Category as { id: string; name: string; gender: string } | null;

  return {
    id: tournamentRow.id,
    name: tournamentRow.name,
    format: tournamentRow.format,
    status: isTournamentStatus(tournamentRow.status) ? tournamentRow.status : "DRAFT",
    schedulingRules: schedulingRulesFromRow(tournamentRow),
    discipline: { id: discipline?.id ?? "", name: discipline?.name ?? "" },
    category: { id: category?.id ?? "", name: category?.name ?? "", gender: category?.gender ?? "" },
    createdAt: tournamentRow.createdAt,
    updatedAt: tournamentRow.updatedAt,
  };
}

export async function getTournamentDetail(id: string) {
  const supabase = getSupabase();

  const fetchTournamentBundle = async (useLegacy = false) =>
    Promise.all([
      supabase.from("Tournament").select(useLegacy ? TOURNAMENT_DETAIL_LEGACY_SELECT : TOURNAMENT_DETAIL_SELECT).eq("id", id).single(),
      supabase.from("TournamentTeam").select(TOURNAMENT_TEAM_SELECT).eq("tournamentId", id),
      supabase
        .from("Match")
        .select(useLegacy ? MATCH_DETAIL_LEGACY_SELECT : MATCH_DETAIL_SELECT)
        .eq("tournamentId", id)
        .order("round", { ascending: true, nullsFirst: false })
        .order("createdAt", { ascending: true }),
    ]);

  let [{ data: tournament, error: tournamentError }, { data: teams, error: teamsError }, { data: matches, error: matchesError }] =
    await fetchTournamentBundle();

  if ((tournamentError && hasMissingTournamentColumns(tournamentError)) || (matchesError && hasMissingTournamentColumns(matchesError))) {
    [{ data: tournament, error: tournamentError }, { data: teams, error: teamsError }, { data: matches, error: matchesError }] =
      await fetchTournamentBundle(true);
  }

  if (tournamentError || !tournament) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  if (teamsError) {
    throw teamsError;
  }

  if (matchesError) {
    throw matchesError;
  }

  const tournamentRow = tournament as unknown as Record<string, unknown> & {
    id: string;
    name: string;
    format: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    scheduleStartDate?: string | null;
    scheduleEndDate?: string | null;
    scheduleMatchesPerMatchday?: number | null;
    scheduleAllowedWeekdays?: number[] | null;
    scheduleDailyStartTime?: string | null;
    scheduleDailyEndTime?: string | null;
    scheduleMatchDurationMinutes?: number | null;
    Discipline?: unknown;
    Category?: unknown;
  };
  const teamEntries = (teams ?? []) as unknown as Array<{ id: string; tournamentId: string; teamId: string; Team?: unknown }>;
  const matchEntries = (matches ?? []) as unknown as Array<{
    id: string;
    tournamentId: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
    date: string | null;
    location: string | null;
    homeScore: number | null;
    awayScore: number | null;
    isFinished: boolean;
    status?: string;
    incidentType?: string | null;
    incidentNotes?: string | null;
    round: number | null;
    groupName: string | null;
    matchLogicIdentifier: string | null;
    createdAt: string;
    updatedAt: string;
  }>;

  const normalizedStatus = isTournamentStatus(tournamentRow.status) ? tournamentRow.status : "DRAFT";
  const discipline = tournamentRow.Discipline as { id: string; name: string } | null;
  const category = tournamentRow.Category as { id: string; name: string; gender: string } | null;
  const teamsMap = buildTeamsMap(teamEntries);
  const effectiveFormat = resolveFixtureFormat(tournamentRow.format, matchEntries);

  let normalizedMatchEntries = (matches ?? []) as unknown as Array<{
    id: string;
    tournamentId: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
    date: string | null;
    location: string | null;
    homeScore: number | null;
    awayScore: number | null;
    isFinished: boolean;
    status?: string;
    incidentType?: string | null;
    incidentNotes?: string | null;
    round: number | null;
    groupName: string | null;
    matchLogicIdentifier: string | null;
    createdAt: string;
    updatedAt: string;
  }>;

  if (effectiveFormat) {
    const assignments = buildAutomaticFixtureAssignments({
      format: effectiveFormat,
      teams: teamEntries.map((entry) => {
        const team = entry.Team as { id?: string; name?: string } | null | undefined;
        return {
          id: team?.id ?? entry.teamId,
          name: team?.name ?? "",
        };
      }),
      matches: normalizedMatchEntries.map((match) => ({
        id: match.id,
        round: match.round,
        groupName: match.groupName,
        matchLogicIdentifier: match.matchLogicIdentifier,
        date: match.date,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        isFinished: match.isFinished,
        createdAt: match.createdAt,
      })),
    });

    const assignmentsByMatchId = new Map(assignments.map((assignment) => [assignment.matchId, assignment]));

    normalizedMatchEntries = normalizedMatchEntries.map((match) => {
      const assignment = assignmentsByMatchId.get(match.id);

      if (!assignment || match.isFinished) {
        return match;
      }

      return {
        ...match,
        homeTeamId: assignment.homeTeamId,
        awayTeamId: assignment.awayTeamId,
      };
    });
  }

  return {
    id: tournamentRow.id,
    name: tournamentRow.name,
    format: effectiveFormat,
    status: deriveTournamentStatus({
      teamCount: teamEntries.length,
      matchCount: normalizedMatchEntries.length,
      finishedMatchCount: normalizedMatchEntries.filter((match) => match.isFinished).length,
      format: effectiveFormat,
      status: normalizedStatus,
    }),
    schedulingRules: schedulingRulesFromRow(tournamentRow),
    createdAt: tournamentRow.createdAt,
    updatedAt: tournamentRow.updatedAt,
    discipline: { id: discipline?.id ?? "", name: discipline?.name ?? "" },
    category: { id: category?.id ?? "", name: category?.name ?? "", gender: category?.gender ?? "" },
    teams: teamEntries.map((entry) => mapTournamentTeamEntry(entry)),
    matches: normalizedMatchEntries.map((match) => ({
      id: match.id,
      tournamentId: match.tournamentId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      date: match.date,
      location: match.location,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      isFinished: match.isFinished,
      status: normalizeMatchStatus(match.status, match.isFinished),
      incidentType: isMatchIncidentType(match.incidentType) ? match.incidentType : null,
      incidentNotes: match.incidentNotes ?? null,
      round: match.round,
      groupName: match.groupName,
      matchLogicIdentifier: match.matchLogicIdentifier,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      homeTeam: match.homeTeamId ? teamsMap.get(match.homeTeamId) ?? null : null,
      awayTeam: match.awayTeamId ? teamsMap.get(match.awayTeamId) ?? null : null,
    } satisfies TournamentMatchEntry)),
  } satisfies TournamentDetail;
}

export async function deleteTournament(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("Tournament").delete().eq("id", id);
  if (error) {
    throw error;
  }

  return { success: true };
}

export async function updateTournament(input: {
  id: string;
  name?: string;
  disciplineId?: string;
  categoryId?: string;
  format?: string | null;
  status?: TournamentStatus;
  schedulingRules?: Partial<FixtureSchedulingRules> | null;
}) {
  const supabase = getSupabase();
  const [{ data: currentTournament }, { count: teamCount }, { count: matchCount }, { count: finishedMatchCount }] = await Promise.all([
    supabase.from("Tournament").select("id, format, status").eq("id", input.id).single(),
    supabase.from("TournamentTeam").select("id", { count: "exact", head: true }).eq("tournamentId", input.id),
    supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", input.id),
    supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", input.id).eq("isFinished", true),
  ]);

  if (!currentTournament) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  const currentStatus = deriveTournamentStatus({
    teamCount: teamCount ?? 0,
    matchCount: matchCount ?? 0,
    finishedMatchCount: finishedMatchCount ?? 0,
    format: currentTournament.format,
    status: currentTournament.status,
  });

  const updateData: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) updateData.name = input.name.trim();
  if (typeof input.disciplineId === "string" && input.disciplineId.trim()) updateData.disciplineId = input.disciplineId.trim();
  if (typeof input.categoryId === "string" && input.categoryId.trim()) updateData.categoryId = input.categoryId.trim();
  if (input.format === null || typeof input.format === "string") updateData.format = input.format;
  if (input.schedulingRules && typeof input.schedulingRules === "object") {
    Object.assign(updateData, schedulingRulesToRow(input.schedulingRules));
  }

  if (input.status !== undefined) {
    if (!isTournamentStatus(input.status)) {
      throw new ServiceError(400, "Estado de torneo invalido");
    }

    if (!canTransitionTournamentStatus(currentStatus, input.status)) {
      throw new ServiceError(409, `Transicion invalida: ${currentStatus} -> ${input.status}`);
    }

    updateData.status = input.status;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ServiceError(400, "No hay cambios para aplicar");
  }

  const { data, error } = await supabase
    .from("Tournament")
    .update(updateData)
    .eq("id", input.id)
    .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  const discipline = data.Discipline as unknown as { id: string; name: string } | null;
  const category = data.Category as unknown as { id: string; name: string; gender: string } | null;
  return {
    id: data.id,
    name: data.name,
    format: data.format,
    status: deriveTournamentStatus({
      teamCount: teamCount ?? 0,
      matchCount: matchCount ?? 0,
      finishedMatchCount: finishedMatchCount ?? 0,
      format: data.format,
      status: data.status,
    }),
    schedulingRules: schedulingRulesFromRow(data),
    discipline: { id: discipline?.id ?? "", name: discipline?.name ?? "" },
    category: { id: category?.id ?? "", name: category?.name ?? "", gender: category?.gender ?? "" },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listTournamentTeams(tournamentId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("TournamentTeam").select(TOURNAMENT_TEAM_SELECT).eq("tournamentId", tournamentId);
  if (error) {
    throw error;
  }

  return (data ?? []).map((entry) => mapTournamentTeamEntry(entry));
}

export async function addTeamToTournament(input: { tournamentId: string; teamId: string }) {
  const supabase = getSupabase();
  const teamId = input.teamId.trim();
  if (!teamId) {
    throw new ServiceError(400, "teamId es requerido");
  }

  const [{ data: tournament }, { data: matches }] = await Promise.all([
    supabase.from("Tournament").select("id, format, status").eq("id", input.tournamentId).single(),
    supabase.from("Match").select("id").eq("tournamentId", input.tournamentId).limit(1),
  ]);

  if (!tournament) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  if ((matches ?? []).length > 0) {
    throw new ServiceError(409, "No puedes modificar equipos cuando el fixture ya fue generado");
  }

  const { data, error } = await supabase
    .from("TournamentTeam")
    .insert({ id: crypto.randomUUID(), tournamentId: input.tournamentId, teamId })
    .select(TOURNAMENT_TEAM_SELECT)
    .single();

  if (error || !data) {
    throw error;
  }

  const { count: teamCount } = await supabase.from("TournamentTeam").select("id", { count: "exact", head: true }).eq("tournamentId", input.tournamentId);

  await supabase
    .from("Tournament")
    .update({
      status: deriveTournamentStatus({
        teamCount: teamCount ?? 0,
        matchCount: 0,
        format: tournament.format,
        status: tournament.status,
      }),
    })
    .eq("id", input.tournamentId);

  return mapTournamentTeamEntry(data);
}

export async function removeTeamFromTournament(input: { tournamentId: string; teamEntryId: string }) {
  const supabase = getSupabase();
  const [{ data: tournament }, { data: matches }] = await Promise.all([
    supabase.from("Tournament").select("id, format, status").eq("id", input.tournamentId).single(),
    supabase.from("Match").select("id").eq("tournamentId", input.tournamentId).limit(1),
  ]);

  if (!tournament) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  if ((matches ?? []).length > 0) {
    throw new ServiceError(409, "No puedes quitar equipos cuando el fixture ya fue generado");
  }

  const { error } = await supabase.from("TournamentTeam").delete().eq("id", input.teamEntryId);
  if (error) {
    throw error;
  }

  const { count: teamCount } = await supabase.from("TournamentTeam").select("id", { count: "exact", head: true }).eq("tournamentId", input.tournamentId);

  await supabase
    .from("Tournament")
    .update({
      status: deriveTournamentStatus({
        teamCount: teamCount ?? 0,
        matchCount: 0,
        format: tournament.format,
        status: tournament.status,
      }),
    })
    .eq("id", input.tournamentId);

  return { success: true };
}