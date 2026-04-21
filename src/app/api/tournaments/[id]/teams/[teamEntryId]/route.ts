import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; teamEntryId: string }> }) {
  try {
    const supabase = getSupabase();
    const { teamEntryId } = await params;
    const { error } = await supabase.from("TournamentTeam").delete().eq("id", teamEntryId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id]/teams/[teamEntryId] failed:", error);
    return NextResponse.json({ error: "No se pudo quitar el equipo del torneo" }, { status: 500 });
  }
}
