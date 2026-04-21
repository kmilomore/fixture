import { NextResponse } from "next/server";
import { updateMatchResult } from "@/features/fixture/application/fixture-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(
      await updateMatchResult({
        matchId: id,
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        location: body.location,
        date: body.date,
        status: body.status,
        isFinished: body.isFinished,
        incidentType: body.incidentType,
        incidentNotes: body.incidentNotes,
      })
    );
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo actualizar el partido");
    console.error("PATCH /api/matches/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
