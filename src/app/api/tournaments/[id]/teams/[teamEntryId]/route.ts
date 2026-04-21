import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { deriveTournamentStatus } from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; teamEntryId: string }> }) {
  try {
    const supabase = getSupabase();
    const { id, teamEntryId } = await params;
    const [{ data: tournament }, { data: matches }] = await Promise.all([
      supabase.from("Tournament").select("id, format, status").eq("id", id).single(),
      supabase.from("Match").select("id").eq("tournamentId", id).limit(1),
    ]);

    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    if ((matches ?? []).length > 0) {
      return NextResponse.json({ error: "No puedes quitar equipos cuando el fixture ya fue generado" }, { status: 409 });
    }

    const { error } = await supabase.from("TournamentTeam").delete().eq("id", teamEntryId);
    if (error) throw error;

    const { count: teamCount } = await supabase
      .from("TournamentTeam")
      .select("id", { count: "exact", head: true })
      .eq("tournamentId", id);

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
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id]/teams/[teamEntryId] failed:", error);
    return NextResponse.json({ error: "No se pudo quitar el equipo del torneo" }, { status: 500 });
  }
}
