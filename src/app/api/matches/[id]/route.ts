import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const match = await prisma.match.update({
      where: { id },
      data: {
        homeScore: typeof body.homeScore === "number" ? body.homeScore : undefined,
        awayScore: typeof body.awayScore === "number" ? body.awayScore : undefined,
        isFinished: typeof body.isFinished === "boolean" ? body.isFinished : true,
        location: typeof body.location === "string" ? body.location.trim() || null : undefined,
        date: typeof body.date === "string" && body.date ? new Date(body.date) : body.date === null ? null : undefined,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("PATCH /api/matches/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el partido" },
      { status: 500 }
    );
  }
}