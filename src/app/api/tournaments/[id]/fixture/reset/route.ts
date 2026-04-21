import { NextResponse } from "next/server";
import { resetFixture } from "@/features/fixture/application/fixture-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await resetFixture(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo reiniciar el fixture");
    console.error("POST /api/tournaments/[id]/fixture/reset failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
