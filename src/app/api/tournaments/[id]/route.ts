import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        format: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        discipline: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            gender: true,
          },
        },
        teams: {
          select: {
            id: true,
            tournamentId: true,
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
                establishmentId: true,
                createdAt: true,
                updatedAt: true,
                establishment: true,
              },
            },
          },
        },
        matches: {
          select: {
            id: true,
            tournamentId: true,
            homeTeamId: true,
            awayTeamId: true,
            date: true,
            location: true,
            homeScore: true,
            awayScore: true,
            isFinished: true,
            round: true,
            groupName: true,
            matchLogicIdentifier: true,
            createdAt: true,
            updatedAt: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                establishmentId: true,
                createdAt: true,
                updatedAt: true,
                establishment: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                establishmentId: true,
                createdAt: true,
                updatedAt: true,
                establishment: true,
              },
            },
          },
          orderBy: [{ round: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: tournament.id,
      name: tournament.name,
      format: tournament.format,
      status: tournament.status,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
      discipline: tournament.discipline,
      category: tournament.category,
      teams: tournament.teams.map((entry) => ({
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
      })),
      matches: tournament.matches.map((match) => ({
        id: match.id,
        tournamentId: match.tournamentId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date?.toISOString() ?? null,
        location: match.location,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        isFinished: match.isFinished,
        round: match.round,
        groupName: match.groupName,
        matchLogicIdentifier: match.matchLogicIdentifier,
        createdAt: match.createdAt.toISOString(),
        updatedAt: match.updatedAt.toISOString(),
        homeTeam: match.homeTeam
          ? {
              ...match.homeTeam,
              createdAt: match.homeTeam.createdAt.toISOString(),
              updatedAt: match.homeTeam.updatedAt.toISOString(),
            }
          : null,
        awayTeam: match.awayTeam
          ? {
              ...match.awayTeam,
              createdAt: match.awayTeam.createdAt.toISOString(),
              updatedAt: match.awayTeam.updatedAt.toISOString(),
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/tournaments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el torneo" },
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

    const data: {
      name?: string;
      disciplineId?: string;
      categoryId?: string;
      format?: string | null;
      status?: string;
    } = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.disciplineId === "string" && body.disciplineId.trim()) data.disciplineId = body.disciplineId.trim();
    if (typeof body.categoryId === "string" && body.categoryId.trim()) data.categoryId = body.categoryId.trim();
    if (typeof body.status === "string" && body.status.trim()) data.status = body.status.trim();
    if (body.format === null || typeof body.format === "string") data.format = body.format;

    const tournament = await prisma.tournament.update({
      where: { id },
      data,
      include: { discipline: true, category: true },
    });

    return NextResponse.json({
      id: tournament.id,
      name: tournament.name,
      format: tournament.format,
      status: tournament.status,
      discipline: tournament.discipline,
      category: tournament.category,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/tournaments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el torneo" },
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
    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el torneo" },
      { status: 500 }
    );
  }
}