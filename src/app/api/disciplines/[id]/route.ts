import { NextResponse } from "next/server";
import {
  deleteDiscipline,
  getDisciplineDetail,
  updateDiscipline,
} from "@/features/disciplines/application/catalog-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getDisciplineDetail(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo consultar la disciplina");
    console.error("GET /api/disciplines/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(await updateDiscipline({ id, name: body.name }));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo actualizar la disciplina");
    console.error("PATCH /api/disciplines/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteDiscipline(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo eliminar la disciplina");
    console.error("DELETE /api/disciplines/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
