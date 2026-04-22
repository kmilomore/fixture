import { getSupabase } from "@/infrastructure/supabase/client";
import {
  generateFixtureMatches,
  type FixtureFormat,
  type FixtureGenerationOptions,
  type FixtureSchedulingRules,
} from "@/features/fixture/domain/fixture-engine";
import { syncAutomaticFixtureAssignments } from "@/features/fixture/application/automatic-assignment-service";
import {
  deriveTournamentStatus,
  isTournamentStatus,
  schedulingRulesToRow,
} from "@/features/tournaments/domain/tournament-lifecycle";
import {
  isFinishedMatchStatus,
  isMatchIncidentType,
  isMatchStatus,
  type MatchIncidentType,
  type MatchStatus,
} from "@/features/fixture/domain/match-lifecycle";
import { ServiceError } from "@/shared/lib/service-error";

function isNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function toMatchDateValue(value: Date | string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "string") {
    return value;
  }

  return value.toISOString();
}

export async function setTournamentFormat(input: {
  tournamentId: string;
  format: FixtureFormat;
  schedulingRules?: FixtureSchedulingRules;
}) {
  const supabase = getSupabase();
  if (!input.format) {
    throw new ServiceError(400, "El formato es requerido");
  }

  const { count: teamCount } = await supabase
    .from("TournamentTeam")
    .select("id", { count: "exact", head: true })
    .eq("tournamentId", input.tournamentId);

  const { data, error } = await supabase
    .from("Tournament")
    .update({
      format: input.format,
      status: deriveTournamentStatus({
        teamCount: teamCount ?? 0,
        matchCount: 0,
        format: input.format,
        status: "DRAFT",
      }),
      ...schedulingRulesToRow(input.schedulingRules),
    })
    .eq("id", input.tournamentId)
    .select("id, format, status, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  return data;
}

export async function generateFixture(input: { tournamentId: string; options: FixtureGenerationOptions }) {
  const supabase = getSupabase();
  const [{ data: tournament }, { data: teams }, { data: matches }] = await Promise.all([
    supabase.from("Tournament").select("id").eq("id", input.tournamentId).single(),
    supabase.from("TournamentTeam").select("teamId, Team(id, name)").eq("tournamentId", input.tournamentId),
    supabase.from("Match").select("id").eq("tournamentId", input.tournamentId),
  ]);

  if (!tournament) {
    throw new ServiceError(404, "Torneo no encontrado");
  }

  if (!input.options.format) {
    throw new ServiceError(400, "Debes seleccionar el formato primero");
  }

  const teamRows = (teams ?? []).map((entry) => {
    const team = entry.Team as unknown as { id: string; name: string } | null;
    return { id: team?.id ?? entry.teamId, name: team?.name ?? "" };
  });

  if (teamRows.length < 2) {
    throw new ServiceError(400, "Necesitas al menos 2 equipos para generar el fixture");
  }

  if ((matches ?? []).length > 0) {
    throw new ServiceError(409, "Este torneo ya tiene partidos generados");
  }

  const fixtureMatches = generateFixtureMatches(teamRows, input.options);
  const matchInserts = fixtureMatches.map((match) => ({
    id: crypto.randomUUID(),
    tournamentId: input.tournamentId,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    round: match.round,
    groupName: match.groupName,
    matchLogicIdentifier: match.matchLogicIdentifier,
    date: toMatchDateValue(match.date) ?? null,
  }));

  const { error: insertError } = await supabase.from("Match").insert(matchInserts);
  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await supabase
    .from("Tournament")
    .update({ status: "SCHEDULED", format: input.options.format, ...schedulingRulesToRow(input.options.schedulingRules) })
    .eq("id", input.tournamentId);
  if (updateError) {
    throw updateError;
  }

  await syncAutomaticFixtureAssignments({
    tournamentId: input.tournamentId,
    format: input.options.format,
  });

  return { success: true, count: fixtureMatches.length };
}

export async function resetFixture(tournamentId: string) {
  const supabase = getSupabase();
  const { error: deleteError } = await supabase.from("Match").delete().eq("tournamentId", tournamentId);
  if (deleteError) {
    throw deleteError;
  }

  const { error: updateError } = await supabase.from("Tournament").update({ status: "DRAFT", format: null }).eq("id", tournamentId);
  if (updateError) {
    throw updateError;
  }

  return { success: true };
}

export async function updateMatchResult(input: {
  matchId: string;
  homeScore?: number;
  awayScore?: number;
  location?: string | null;
  date?: Date | string | null;
  status: MatchStatus;
  isFinished?: boolean;
  incidentType?: MatchIncidentType | null;
  incidentNotes?: string | null;
}) {
  const supabase = getSupabase();
  const nextStatus = isMatchStatus(input.status) ? input.status : undefined;
  const nextIncidentType = input.incidentType === null ? null : isMatchIncidentType(input.incidentType) ? input.incidentType : undefined;

  if (!nextStatus) {
    throw new ServiceError(400, "Estado de partido invalido");
  }

  if (input.incidentType !== undefined && nextIncidentType === undefined) {
    throw new ServiceError(400, "Tipo de incidencia invalido");
  }

  const requiresScore = nextStatus === "FINISHED" || nextStatus === "WALKOVER";
  const providedScore = input.homeScore !== undefined || input.awayScore !== undefined;
  const trimmedIncidentNotes = typeof input.incidentNotes === "string" ? input.incidentNotes.trim() : "";

  if (requiresScore) {
    if (!isNonNegativeInteger(input.homeScore) || !isNonNegativeInteger(input.awayScore)) {
      throw new ServiceError(400, "Debes informar marcador valido para partidos finalizados o walkover");
    }
  } else if (providedScore) {
    throw new ServiceError(400, "Solo puedes registrar marcador cuando el partido esta en FINISHED o WALKOVER");
  }

  if (nextIncidentType && typeof input.incidentNotes !== "string") {
    throw new ServiceError(400, "Las incidencias deben incluir una nota descriptiva");
  }

  if (nextIncidentType && !trimmedIncidentNotes) {
    throw new ServiceError(400, "Las incidencias deben incluir una nota descriptiva");
  }

  if (!nextIncidentType && trimmedIncidentNotes) {
    throw new ServiceError(400, "No puedes guardar notas de incidencia sin un tipo de incidencia");
  }

  const updateData: Record<string, unknown> = {
    isFinished: typeof input.isFinished === "boolean" ? input.isFinished : isFinishedMatchStatus(nextStatus),
    status: nextStatus,
  };

  if (requiresScore) {
    updateData.homeScore = input.homeScore;
    updateData.awayScore = input.awayScore;
  } else {
    updateData.homeScore = null;
    updateData.awayScore = null;
  }

  if (input.location !== undefined) {
    updateData.location = typeof input.location === "string" ? input.location.trim() || null : null;
  }

  if (input.date !== undefined) {
    updateData.date = toMatchDateValue(input.date);
  }

  if (nextIncidentType !== undefined) {
    updateData.incidentType = nextIncidentType;
  }

  if (input.incidentNotes !== undefined) {
    updateData.incidentNotes = trimmedIncidentNotes || null;
  }

  const { data, error } = await supabase
    .from("Match")
    .update(updateData)
    .eq("id", input.matchId)
    .select("id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, status, incidentType, incidentNotes, round, groupName, matchLogicIdentifier, createdAt, updatedAt")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Partido no encontrado");
  }

  const [{ count: matchCount }, { count: finishedMatchCount }, { data: tournament }] = await Promise.all([
    supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", data.tournamentId),
    supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", data.tournamentId).eq("isFinished", true),
    supabase.from("Tournament").select("id, format, status").eq("id", data.tournamentId).single(),
  ]);

  if (tournament) {
    const normalizedStatus = isTournamentStatus(tournament.status) ? tournament.status : "DRAFT";

    await syncAutomaticFixtureAssignments({
      tournamentId: data.tournamentId,
      format: tournament.format as FixtureFormat | null,
    });

    const { count: teamCount } = await supabase.from("TournamentTeam").select("id", { count: "exact", head: true }).eq("tournamentId", data.tournamentId);
    await supabase
      .from("Tournament")
      .update({
        status: deriveTournamentStatus({
          teamCount: teamCount ?? 0,
          matchCount: matchCount ?? 0,
          finishedMatchCount: finishedMatchCount ?? 0,
          format: tournament.format,
          status: normalizedStatus,
        }),
      })
      .eq("id", data.tournamentId);
  }

  return data;
}