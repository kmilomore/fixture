import { NextResponse } from "next/server";
import { removeTeamFromTournament } from "@/features/tournaments/application/tournament-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; teamEntryId: string }> }) {
  try {
    const { id, teamEntryId } = await params;
    await removeTeamFromTournament({ tournamentId: id, teamEntryId });

    return NextResponse.json({ success: true });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo quitar el equipo del torneo");
    console.error("DELETE /api/tournaments/[id]/teams/[teamEntryId] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
