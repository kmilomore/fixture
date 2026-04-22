import { NextResponse } from "next/server";
import {
  deleteTeam,
  getTeamDetail,
  updateTeam,
} from "@/features/teams/application/team-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getTeamDetail(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo consultar el equipo");
    console.error("GET /api/teams/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(
      await updateTeam({
        id,
        name: body.name,
        establishmentId: body.establishmentId,
      })
    );
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo actualizar el equipo");
    console.error("PATCH /api/teams/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteTeam(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo eliminar el equipo");
    console.error("DELETE /api/teams/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
