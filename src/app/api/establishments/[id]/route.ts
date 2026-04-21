import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeComuna } from "@/lib/establishments";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const establishment = await prisma.establishment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        comuna: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { teams: true } },
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: establishment.id,
      name: establishment.name,
      comuna: establishment.comuna,
      logoUrl: establishment.logoUrl,
      teamsCount: establishment._count.teams,
      createdAt: establishment.createdAt.toISOString(),
      updatedAt: establishment.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/establishments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el establecimiento" },
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
    const establishment = await prisma.establishment.update({
      where: { id },
      data: {
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
        comuna: body.comuna === undefined ? undefined : normalizeComuna(body.comuna),
        logoUrl: typeof body.logoUrl === "string" ? body.logoUrl.trim() || null : undefined,
      },
    });

    return NextResponse.json({
      id: establishment.id,
      name: establishment.name,
      comuna: establishment.comuna,
      logoUrl: establishment.logoUrl,
      createdAt: establishment.createdAt.toISOString(),
      updatedAt: establishment.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/establishments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el establecimiento" },
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
    await prisma.establishment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/establishments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el establecimiento" },
      { status: 500 }
    );
  }
}