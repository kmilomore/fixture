import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { deriveTournamentStatus } from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      isFinished: typeof body.isFinished === "boolean" ? body.isFinished : true,
    };
    if (typeof body.homeScore === "number") updateData.homeScore = body.homeScore;
    if (typeof body.awayScore === "number") updateData.awayScore = body.awayScore;
    if (typeof body.location === "string") updateData.location = body.location.trim() || null;
    if (body.date !== undefined) updateData.date = body.date === null ? null : body.date;

    const { data, error } = await supabase
      .from("Match")
      .update(updateData)
      .eq("id", id)
      .select("id, tournamentId, homeTeamId, awayTeamId, date, location, homeScore, awayScore, isFinished, round, groupName, matchLogicIdentifier, createdAt, updatedAt")
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
