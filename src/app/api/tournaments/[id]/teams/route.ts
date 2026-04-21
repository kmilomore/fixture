import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: {
        team: {
          include: {
            establishment: true,
          },
        },
      },
    });

    return NextResponse.json(
      teams.map((entry) => ({
        id: entry.id,
        tournamentId: entry.tournamentId,
        teamId: entry.teamId,
        team: {
          id: entry.team.id,
          name: entry.team.name,
          establishmentId: entry.team.establishmentId,
          establishment: entry.team.establishment,
          createdAt: entry.team.createdAt.toISOString(),
          updatedAt: entry.team.updatedAt.toISOString(),
        },
      }))
    );
  } catch (error) {
    console.error("GET /api/tournaments/[id]/teams failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los equipos del torneo" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const teamId = typeof body.teamId === "string" ? body.teamId.trim() : "";

    if (!teamId) {
      return NextResponse.json({ error: "teamId es requerido" }, { status: 400 });
    }

    const entry = await prisma.tournamentTeam.create({
      data: { tournamentId: id, teamId },
      include: {
        team: {
          include: { establishment: true },
        },
      },
    });

    return NextResponse.json(
      {
        id: entry.id,
        tournamentId: entry.tournamentId,
        teamId: entry.teamId,
        team: {
          id: entry.team.id,
          name: entry.team.name,
          establishmentId: entry.team.establishmentId,
          establishment: entry.team.establishment,
          createdAt: entry.team.createdAt.toISOString(),
          updatedAt: entry.team.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tournaments/[id]/teams failed:", error);
    return NextResponse.json(
      { error: "No se pudo agregar el equipo al torneo" },
      { status: 500 }
    );
  }
}