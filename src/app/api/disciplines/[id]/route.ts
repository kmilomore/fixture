import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discipline = await prisma.discipline.findUnique({ where: { id } });

    if (!discipline) {
      return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id: discipline.id,
      name: discipline.name,
      createdAt: discipline.createdAt.toISOString(),
      updatedAt: discipline.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/disciplines/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disciplina" },
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
    const discipline = await prisma.discipline.update({
      where: { id },
      data: {
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
      },
    });

    return NextResponse.json({
      id: discipline.id,
      name: discipline.name,
      createdAt: discipline.createdAt.toISOString(),
      updatedAt: discipline.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/disciplines/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la disciplina" },
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
    await prisma.discipline.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/disciplines/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la disciplina" },
      { status: 500 }
    );
  }
}