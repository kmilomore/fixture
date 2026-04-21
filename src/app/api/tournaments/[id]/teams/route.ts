import { NextResponse } from "next/server";
import { addTeamToTournament, listTournamentTeams } from "@/features/tournaments/application/tournament-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await listTournamentTeams(id));
  } catch (error) {
    console.error("GET /api/tournaments/[id]/teams failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los equipos del torneo" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const teamEntry = await addTeamToTournament({
      tournamentId: id,
      teamId: typeof body.teamId === "string" ? body.teamId : "",
    });
    return NextResponse.json(teamEntry, { status: 201 });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo agregar el equipo al torneo");
    console.error("POST /api/tournaments/[id]/teams failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
