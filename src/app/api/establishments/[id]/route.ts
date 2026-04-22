import { NextResponse } from "next/server";
import {
  deleteEstablishment,
  getEstablishmentDetail,
  updateEstablishment,
} from "@/features/establishments/application/establishment-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getEstablishmentDetail(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo consultar el establecimiento");
    console.error("GET /api/establishments/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(
      await updateEstablishment({
        id,
        name: body.name,
        comuna: body.comuna,
        logoUrl: body.logoUrl,
      })
    );
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo actualizar el establecimiento");
    console.error("PATCH /api/establishments/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteEstablishment(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo eliminar el establecimiento");
    console.error("DELETE /api/establishments/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
