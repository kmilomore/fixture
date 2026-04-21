import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { deriveTournamentStatus } from "@/lib/tournamentLifecycle";
import { isFinishedMatchStatus, isMatchIncidentType, isMatchStatus } from "@/lib/matchLifecycle";

function isNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const nextStatus = isMatchStatus(body.status) ? body.status : undefined;
    const nextIncidentType = body.incidentType === null
      ? null
      : isMatchIncidentType(body.incidentType)
        ? body.incidentType
        : undefined;

    if (body.status !== undefined && !nextStatus) {
      return NextResponse.json({ error: "Estado de partido inválido" }, { status: 400 });
    }

    if (body.incidentType !== undefined && nextIncidentType === undefined) {
      return NextResponse.json({ error: "Tipo de incidencia inválido" }, { status: 400 });
    }

    const requiresScore = nextStatus === "FINISHED" || nextStatus === "WALKOVER";
    const providedScore = body.homeScore !== undefined || body.awayScore !== undefined;

    if (requiresScore) {
      if (!isNonNegativeInteger(body.homeScore) || !isNonNegativeInteger(body.awayScore)) {
        return NextResponse.json({ error: "Debes informar marcador válido para partidos finalizados o walkover" }, { status: 400 });
      }
    } else if (providedScore) {
      return NextResponse.json({ error: "Solo puedes registrar marcador cuando el partido está en FINISHED o WALKOVER" }, { status: 400 });
    }

    if (nextIncidentType && typeof body.incidentNotes !== "string") {
      return NextResponse.json({ error: "Las incidencias deben incluir una nota descriptiva" }, { status: 400 });
    }

    if (nextIncidentType && !body.incidentNotes.trim()) {
      return NextResponse.json({ error: "Las incidencias deben incluir una nota descriptiva" }, { status: 400 });
    }

    if (!nextIncidentType && body.incidentNotes && typeof body.incidentNotes === "string" && body.incidentNotes.trim()) {
      return NextResponse.json({ error: "No puedes guardar notas de incidencia sin un tipo de incidencia" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      isFinished: typeof body.isFinished === "boolean" ? body.isFinished : nextStatus ? isFinishedMatchStatus(nextStatus) : true,
    };
    if (requiresScore && isNonNegativeInteger(body.homeScore)) updateData.homeScore = body.homeScore;
    if (requiresScore && isNonNegativeInteger(body.awayScore)) updateData.awayScore = body.awayScore;
    if (!requiresScore && nextStatus) {
      updateData.homeScore = null;
      updateData.awayScore = null;
    }
    if (typeof body.location === "string") updateData.location = body.location.trim() || null;
    if (body.date !== undefined) updateData.date = body.date === null ? null : body.date;
    if (nextStatus) updateData.status = nextStatus;
    if (nextIncidentType !== undefined) updateData.incidentType = nextIncidentType;
    if (body.incidentNotes !== undefined) {
      updateData.incidentNotes = typeof body.incidentNotes === "string" ? body.incidentNotes.trim() || null : null;
    }

    const { data, error } = await supabase
      .from("Match")
      .update(updateData)
      .eq("id", id)
      .select("id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, status, incidentType, incidentNotes, round, groupName, matchLogicIdentifier, createdAt, updatedAt")
      .single();

    if (error || !data) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    const [{ count: matchCount }, { count: finishedMatchCount }, { data: tournament }] = await Promise.all([
      supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", data.tournamentId),
      supabase.from("Match").select("id", { count: "exact", head: true }).eq("tournamentId", data.tournamentId).eq("isFinished", true),
      supabase.from("Tournament").select("id, format, status").eq("id", data.tournamentId).single(),
    ]);

    if (tournament) {
      await supabase
        .from("Tournament")
        .update({
          status: deriveTournamentStatus({
            teamCount: 2,
            matchCount: matchCount ?? 0,
            finishedMatchCount: finishedMatchCount ?? 0,
            format: tournament.format,
            status: tournament.status,
          }),
        })
        .eq("id", data.tournamentId);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/matches/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar el partido" }, { status: 500 });
  }
}
