import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const tournaments = await prisma.tournament.findMany({
      where: query
        ? {
            name: {
              contains: query,
              mode: "insensitive",
            },
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        discipline: true,
        category: true,
        _count: {
          select: { teams: true, matches: true },
        },
      },
    });

    return NextResponse.json(
      tournaments.map((tournament) => ({
        id: tournament.id,
        name: tournament.name,
        format: tournament.format,
        status: tournament.status,
        discipline: tournament.discipline,
        category: tournament.category,
        teamsCount: tournament._count.teams,
        matchesCount: tournament._count.matches,
        createdAt: tournament.createdAt.toISOString(),
        updatedAt: tournament.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/tournaments failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los torneos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const disciplineId = typeof body.disciplineId === "string" ? body.disciplineId.trim() : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";

    if (!name || !disciplineId || !categoryId) {
      return NextResponse.json(
        { error: "Nombre, disciplina y categoria son obligatorios" },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: { name, disciplineId, categoryId },
      include: { discipline: true, category: true },
    });

    return NextResponse.json(
      {
        id: tournament.id,
        name: tournament.name,
        format: tournament.format,
        status: tournament.status,
        discipline: tournament.discipline,
        category: tournament.category,
        createdAt: tournament.createdAt.toISOString(),
        updatedAt: tournament.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tournaments failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear el torneo" },
      { status: 500 }
    );
  }
}