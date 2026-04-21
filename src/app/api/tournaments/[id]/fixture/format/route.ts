import { NextResponse } from "next/server";
import type { FixtureFormat } from "@/lib/fixtureEngine";
import { setTournamentFormat } from "@/features/fixture/application/fixture-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const format = body.format as FixtureFormat | undefined;
    const schedulingRules = typeof body.schedulingRules === "object" ? body.schedulingRules : undefined;
    return NextResponse.json(await setTournamentFormat({ tournamentId: id, format: format!, schedulingRules }));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo guardar el formato del fixture");
    console.error("PUT /api/tournaments/[id]/fixture/format failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
