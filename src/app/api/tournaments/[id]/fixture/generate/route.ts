import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateFixtureMatches,
  type FixtureGenerationOptions,
} from "@/lib/fixtureEngine";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const options = (await request.json()) as FixtureGenerationOptions;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { include: { team: true } },
        matches: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    if (!options.format) {
      return NextResponse.json({ error: "Debes seleccionar el formato primero" }, { status: 400 });
    }

    if (tournament.teams.length < 2) {
      return NextResponse.json(
        { error: "Necesitas al menos 2 equipos para generar el fixture" },
        { status: 400 }
      );
    }

    if (tournament.matches.length > 0) {
      return NextResponse.json(
        { error: "Este torneo ya tiene partidos generados" },
        { status: 409 }
      );
    }

    const teams = tournament.teams.map((entry) => ({
      id: entry.team.id,
      name: entry.team.name,
    }));

    const fixtureMatches = generateFixtureMatches(teams, options);

    await prisma.match.createMany({
      data: fixtureMatches.map((match) => ({
        tournamentId: id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        round: match.round,
        groupName: match.groupName,
        matchLogicIdentifier: match.matchLogicIdentifier,
        date: match.date ?? null,
      })),
    });

    await prisma.tournament.update({
      where: { id },
      data: { status: "PLAYING", format: options.format },
    });

    return NextResponse.json({ success: true, count: fixtureMatches.length });
  } catch (error) {
    console.error("POST /api/tournaments/[id]/fixture/generate failed:", error);
    return NextResponse.json(
      { error: "No se pudo generar el fixture" },
      { status: 500 }
    );
  }
}