import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  canTransitionTournamentStatus,
  deriveTournamentStatus,
  isTournamentStatus,
  schedulingRulesFromRow,
  schedulingRulesToRow,
} from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

const TOURNAMENT_DETAIL_SELECT = "id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)";
const TOURNAMENT_DETAIL_LEGACY_SELECT = "id, name, format, status, createdAt, updatedAt, Discipline(id, name), Category(id, name, gender)";
const MATCH_DETAIL_SELECT = "id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, status, incidentType, incidentNotes, round, groupName, matchLogicIdentifier, createdAt, updatedAt";
const MATCH_DETAIL_LEGACY_SELECT = "id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, round, groupName, matchLogicIdentifier, createdAt, updatedAt";

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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const fetchTournamentBundle = async (useLegacy = false) =>
      Promise.all([
        supabase
          .from("Tournament")
          .select(useLegacy ? TOURNAMENT_DETAIL_LEGACY_SELECT : TOURNAMENT_DETAIL_SELECT)
          .eq("id", id)
          .single(),
        supabase
          .from("TournamentTeam")
          .select("id, tournamentId, teamId, Team(id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna))")
          .eq("tournamentId", id),
        supabase
          .from("Match")
          .select(useLegacy ? MATCH_DETAIL_LEGACY_SELECT : MATCH_DETAIL_SELECT)
          .eq("tournamentId", id)
          .order("round", { ascending: true, nullsFirst: false })
          .order("createdAt", { ascending: true }),
      ]);

    let [{ data: tournament, error: e1 }, { data: teams, error: e2 }, { data: matches, error: e3 }] = await fetchTournamentBundle();

    if ((e1 && hasMissingTournamentColumns(e1)) || (e3 && hasMissingTournamentColumns(e3))) {
      [{ data: tournament, error: e1 }, { data: teams, error: e2 }, { data: matches, error: e3 }] = await fetchTournamentBundle(true);
    }

    if (e1 || !tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    if (e2) throw e2;
    if (e3) throw e3;

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
    const matchRows = (matches ?? []) as unknown as Array<{
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
    const normalizedTournamentStatus = isTournamentStatus(tournamentRow.status) ? tournamentRow.status : "DRAFT";

    const disc = tournamentRow.Discipline as unknown as { id: string; name: string } | null;
    const cat = tournamentRow.Category as unknown as { id: string; name: string; gender: string } | null;

    const teamsMap = new Map<string, { id: string; name: string; establishmentId: string; establishment: { id: string; name: string; comuna: string | null }; createdAt: string; updatedAt: string }>();
    for (const entry of teams ?? []) {
      const t = entry.Team as unknown as { id: string; name: string; establishmentId: string; createdAt: string; updatedAt: string; Establishment: { id: string; name: string; comuna: string | null } | null } | null;
      if (t) {
        teamsMap.set(t.id, {
          id: t.id,
          name: t.name,
          establishmentId: t.establishmentId,
          establishment: {
            id: t.Establishment?.id ?? t.establishmentId,
            name: t.Establishment?.name ?? "",
            comuna: t.Establishment?.comuna ?? null,
          },
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      }
    }

    return NextResponse.json({
      id: tournamentRow.id,
      name: tournamentRow.name,
      format: tournamentRow.format,
      status: deriveTournamentStatus({
        teamCount: (teams ?? []).length,
        matchCount: matchRows.length,
        finishedMatchCount: matchRows.filter((match) => match.isFinished).length,
        format: tournamentRow.format,
        status: normalizedTournamentStatus,
      }),
      schedulingRules: schedulingRulesFromRow(tournamentRow),
      createdAt: tournamentRow.createdAt,
      updatedAt: tournamentRow.updatedAt,
      discipline: { id: disc?.id ?? "", name: disc?.name ?? "" },
      category: { id: cat?.id ?? "", name: cat?.name ?? "", gender: cat?.gender ?? "" },
      teams: (teams ?? []).map((entry) => {
        const t = entry.Team as unknown as { id: string; name: string; establishmentId: string; createdAt: string; updatedAt: string; Establishment: { id: string; name: string; comuna: string | null } | null } | null;
        return {
          id: entry.id,
          tournamentId: entry.tournamentId,
          teamId: entry.teamId,
          team: teamsMap.get(entry.teamId) ?? {
            id: entry.teamId,
            name: t?.name ?? "",
            establishmentId: t?.establishmentId ?? "",
            establishment: { id: t?.Establishment?.id ?? "", name: t?.Establishment?.name ?? "", comuna: t?.Establishment?.comuna ?? null },
            createdAt: t?.createdAt ?? "",
            updatedAt: t?.updatedAt ?? "",
          },
        };
      }),
      matches: matchRows.map((m) => ({
        id: m.id,
        tournamentId: m.tournamentId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        date: m.date,
        location: m.location,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        isFinished: m.isFinished,
        status: (m as { status?: string }).status ?? "SCHEDULED",
        incidentType: (m as { incidentType?: string | null }).incidentType ?? null,
        incidentNotes: (m as { incidentNotes?: string | null }).incidentNotes ?? null,
        round: m.round,
        groupName: m.groupName,
        matchLogicIdentifier: m.matchLogicIdentifier,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        homeTeam: m.homeTeamId ? (teamsMap.get(m.homeTeamId) ?? null) : null,
        awayTeam: m.awayTeamId ? (teamsMap.get(m.awayTeamId) ?? null) : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/tournaments/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo consultar el torneo" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const [{ data: currentTournament }, { count: teamCount }, { count: matchCount }, { count: finishedMatchCount }] = await Promise.all([
      supabase.from("Tournament").select("id, format, status").eq("id", id).single(),
      supabase.from("TournamentTeam").select("id", { count: "exact", head: true }).eq("tournamentId", id),
      supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", id),
      supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", id).eq("isFinished", true),
    ]);

    if (!currentTournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    const currentStatus = deriveTournamentStatus({
      teamCount: teamCount ?? 0,
      matchCount: matchCount ?? 0,
      finishedMatchCount: finishedMatchCount ?? 0,
      format: currentTournament.format,
      status: currentTournament.status,
    });

    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.disciplineId === "string" && body.disciplineId.trim()) updateData.disciplineId = body.disciplineId.trim();
    if (typeof body.categoryId === "string" && body.categoryId.trim()) updateData.categoryId = body.categoryId.trim();
    if (body.format === null || typeof body.format === "string") updateData.format = body.format;
    if (body.schedulingRules && typeof body.schedulingRules === "object") {
      Object.assign(updateData, schedulingRulesToRow(body.schedulingRules));
    }

    if (body.status !== undefined) {
      if (!isTournamentStatus(body.status)) {
        return NextResponse.json({ error: "Estado de torneo inválido" }, { status: 400 });
      }

      if (!canTransitionTournamentStatus(currentStatus, body.status)) {
        return NextResponse.json({ error: `Transición inválida: ${currentStatus} -> ${body.status}` }, { status: 409 });
      }

      updateData.status = body.status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay cambios para aplicar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Tournament")
      .update(updateData)
      .eq("id", id)
      .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)")
      .single();

    if (error || !data) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

    const disc = data.Discipline as unknown as { id: string; name: string } | null;
    const cat = data.Category as unknown as { id: string; name: string; gender: string } | null;
    return NextResponse.json({
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
      discipline: { id: disc?.id ?? "", name: disc?.name ?? "" },
      category: { id: cat?.id ?? "", name: cat?.name ?? "", gender: cat?.gender ?? "" },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    console.error("PATCH /api/tournaments/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar el torneo" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { error } = await supabase.from("Tournament").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo eliminar el torneo" }, { status: 500 });
  }
}
