import { NextResponse } from "next/server";
import {
  deleteCategory,
  getCategoryDetail,
  updateCategory,
} from "@/features/disciplines/application/catalog-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getCategoryDetail(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo consultar la categoria");
    console.error("GET /api/categories/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(await updateCategory({ id, name: body.name, gender: body.gender }));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo actualizar la categoria");
    console.error("PATCH /api/categories/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteCategory(id));
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo eliminar la categoria");
    console.error("DELETE /api/categories/[id] failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
