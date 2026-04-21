import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const establishmentId = request.nextUrl.searchParams.get("establishmentId")?.trim() ?? "";

    const teams = await prisma.team.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  {
                    establishment: {
                      name: { contains: query, mode: "insensitive" },
                    },
                  },
                ],
              }
            : {},
          establishmentId ? { establishmentId } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        establishment: true,
      },
    });

    return NextResponse.json(
      teams.map((team) => ({
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
      }))
    );
  } catch (error) {
    console.error("GET /api/teams failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los equipos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const establishmentId = typeof body.establishmentId === "string" ? body.establishmentId.trim() : "";

    if (!name || !establishmentId) {
      return NextResponse.json(
        { error: "Nombre y establecimiento son requeridos" },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: { name, establishmentId },
      include: { establishment: true },
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/teams failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear el equipo" },
      { status: 500 }
    );
  }
}