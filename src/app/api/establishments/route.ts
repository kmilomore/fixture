import { NextRequest, NextResponse } from "next/server";
import { createEstablishment, listEstablishments } from "@/features/establishments/application/establishment-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      await listEstablishments({
        q: request.nextUrl.searchParams.get("q") ?? undefined,
        comuna: request.nextUrl.searchParams.get("comuna") ?? undefined,
      })
    );
  } catch (error) {
    console.error("GET /api/establishments failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los establecimientos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const establishment = await createEstablishment({
      name: typeof body.name === "string" ? body.name : "",
      comuna: body.comuna,
      logoUrl: body.logoUrl,
    });
    return NextResponse.json(establishment, { status: 201 });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo crear el establecimiento");
    console.error("POST /api/establishments failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
