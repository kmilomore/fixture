import { NextResponse } from "next/server";
import {
  deleteTournament,
  getTournamentDetail,
  updateTournament,
} from "@/features/tournaments/application/tournament-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getTournamentDetail(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo consultar el torneo");
    console.error("GET /api/tournaments/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(
      await updateTournament({
        id,
        name: body.name,
        disciplineId: body.disciplineId,
        categoryId: body.categoryId,
        format: body.format,
        status: body.status,
        schedulingRules: body.schedulingRules,
      })
    );
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo actualizar el torneo");
    console.error("PATCH /api/tournaments/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteTournament(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo eliminar el torneo");
    console.error("DELETE /api/tournaments/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
