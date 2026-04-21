import { NextResponse } from "next/server";
import { generateFixture, type FixtureGenerationOptions } from "@/features/fixture/application/fixture-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const options = (await request.json()) as FixtureGenerationOptions;
    return NextResponse.json(await generateFixture({ tournamentId: id, options }));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo generar el fixture");
    console.error("POST /api/tournaments/[id]/fixture/generate failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
