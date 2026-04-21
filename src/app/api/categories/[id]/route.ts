import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id: category.id,
      name: category.name,
      gender: category.gender,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/categories/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la categoria" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
        gender: typeof body.gender === "string" && body.gender.trim() ? body.gender.trim() : undefined,
      },
    });

    return NextResponse.json({
      id: category.id,
      name: category.name,
      gender: category.gender,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/categories/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la categoria" },
      { status: 500 }
    );
  }
}