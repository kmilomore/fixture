import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; teamEntryId: string }> }
) {
  try {
    const { teamEntryId } = await params;
    const result = await postgres.query('DELETE FROM public."TournamentTeam" WHERE "id" = $1', [teamEntryId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Inscripcion no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id]/teams/[teamEntryId] failed:", error);
    return NextResponse.json(
      { error: "No se pudo quitar el equipo del torneo" },
      { status: 500 }
    );
  }
}