import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: { establishment: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: team.id,
      name: team.name,
      establishmentId: team.establishmentId,
      establishment: {
        id: team.establishment.id,
        name: team.establishment.name,
        comuna: team.establishment.comuna,
      },
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/teams/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el equipo" },
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
    const team = await prisma.team.update({
      where: { id },
      data: {
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
        establishmentId:
          typeof body.establishmentId === "string" && body.establishmentId.trim()
            ? body.establishmentId.trim()
            : undefined,
      },
      include: { establishment: true },
    });

    return NextResponse.json({
      id: team.id,
      name: team.name,
      establishmentId: team.establishmentId,
      establishment: {
        id: team.establishment.id,
        name: team.establishment.name,
        comuna: team.establishment.comuna,
      },
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/teams/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el equipo" },
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
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teams/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el equipo" },
      { status: 500 }
    );
  }
}