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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const [{ data: tournament, error: e1 }, { data: teams, error: e2 }, { data: matches, error: e3 }] =
      await Promise.all([
        supabase
          .from("Tournament")
          .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)")
          .eq("id", id)
          .single(),
        supabase
          .from("TournamentTeam")
          .select("id, tournamentId, teamId, Team(id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna))")
          .eq("tournamentId", id),
        supabase
          .from("Match")
          .select("id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, status, incidentType, incidentNotes, round, groupName, matchLogicIdentifier, createdAt, updatedAt")
          .eq("tournamentId", id)
          .order("round", { ascending: true, nullsFirst: false })
          .order("createdAt", { ascending: true }),
      ]);

    if (e1 || !tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    if (e2) throw e2;
    if (e3) throw e3;

    const disc = tournament.Discipline as unknown as { id: string; name: string } | null;
    const cat = tournament.Category as unknown as { id: string; name: string; gender: string } | null;

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
      id: tournament.id,
      name: tournament.name,
      format: tournament.format,
      status: deriveTournamentStatus({
        teamCount: (teams ?? []).length,
        matchCount: (matches ?? []).length,
        finishedMatchCount: (matches ?? []).filter((match) => match.isFinished).length,
        format: tournament.format,
        status: tournament.status,
      }),
      schedulingRules: schedulingRulesFromRow(tournament),
      createdAt: tournament.createdAt,
      updatedAt: tournament.updatedAt,
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
      matches: (matches ?? []).map((m) => ({
        id: m.id,
        tournamentId: m.tournamentId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        date: m.date,
        location: m.location,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        isFinished: m.isFinished,
        status: m.status,
        incidentType: m.incidentType,
        incidentNotes: m.incidentNotes,
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
