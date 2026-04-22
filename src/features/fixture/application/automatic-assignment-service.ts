import { getSupabase } from "@/infrastructure/supabase/client";
import { buildAutomaticFixtureAssignments } from "@/features/fixture/domain/progression";
import type { FixtureFormat } from "@/features/fixture/domain/fixture-engine";
import { resolveFixtureFormat } from "@/features/fixture/domain/fixture-format";

export async function syncAutomaticFixtureAssignments(input: { tournamentId: string; format: FixtureFormat | null }) {
  const supabase = getSupabase();
  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from("Match")
      .select("id, round, groupName, matchLogicIdentifier, date, homeTeamId, awayTeamId, homeScore, awayScore, isFinished, createdAt, status")
      .eq("tournamentId", input.tournamentId)
      .order("round", { ascending: true, nullsFirst: false })
      .order("date", { ascending: true, nullsFirst: false })
      .order("createdAt", { ascending: true }),
    supabase.from("TournamentTeam").select("teamId, Team(id, name)").eq("tournamentId", input.tournamentId),
  ]);

  const normalizedMatches = (matches ?? []).map((match) => ({
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
    status: match.status,
  }));

  const normalizedTeams = (teams ?? []).map((entry) => {
    const team = entry.Team as unknown as { id: string; name: string } | null;
    return { id: team?.id ?? entry.teamId, name: team?.name ?? "" };
  });

  const effectiveFormat = resolveFixtureFormat(input.format, normalizedMatches);
  if (!effectiveFormat) {
    return false;
  }

  const assignments = buildAutomaticFixtureAssignments({
    format: effectiveFormat,
    teams: normalizedTeams,
    matches: normalizedMatches,
  });

  const pendingAssignments = assignments.filter((assignment) => {
    const currentMatch = normalizedMatches.find((match) => match.id === assignment.matchId);
    return Boolean(currentMatch) && !currentMatch?.isFinished;
  });

  if (pendingAssignments.length === 0) {
    return false;
  }

  await Promise.all(
    pendingAssignments.map(async (assignment) => {
      const { error } = await supabase
        .from("Match")
        .update({
          homeTeamId: assignment.homeTeamId,
          awayTeamId: assignment.awayTeamId,
          homeScore: null,
          awayScore: null,
          isFinished: false,
          status: "SCHEDULED",
          incidentType: null,
          incidentNotes: null,
        })
        .eq("id", assignment.matchId);

      if (error) {
        throw error;
      }
    })
  );

  return true;
}