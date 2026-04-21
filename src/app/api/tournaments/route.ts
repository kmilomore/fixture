import { NextRequest, NextResponse } from "next/server";
import { createTournament, listTournaments } from "@/features/tournaments/application/tournament-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    return NextResponse.json(await listTournaments(q));
  } catch (error) {
    console.error("GET /api/tournaments failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los torneos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tournament = await createTournament({
      name: typeof body.name === "string" ? body.name : "",
      disciplineId: typeof body.disciplineId === "string" ? body.disciplineId : "",
      categoryId: typeof body.categoryId === "string" ? body.categoryId : "",
    });
    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo crear el torneo");
    console.error("POST /api/tournaments failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
