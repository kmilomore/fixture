import { NextRequest, NextResponse } from "next/server";
import { createTeam, listTeams } from "@/features/teams/application/team-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      await listTeams({
        q: request.nextUrl.searchParams.get("q") ?? undefined,
        establishmentId: request.nextUrl.searchParams.get("establishmentId") ?? undefined,
      })
    );
  } catch (error) {
    console.error("GET /api/teams failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los equipos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const team = await createTeam({
      name: typeof body.name === "string" ? body.name : "",
      establishmentId: typeof body.establishmentId === "string" ? body.establishmentId : "",
    });
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo crear el equipo");
    console.error("POST /api/teams failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
