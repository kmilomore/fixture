import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const match = await postgres.query<{
      id: string;
      tournamentId: string;
      homeTeamId: string | null;
      awayTeamId: string | null;
      date: Date | null;
      location: string | null;
      homeScore: number | null;
      awayScore: number | null;
      isFinished: boolean;
      round: number | null;
      groupName: string | null;
      matchLogicIdentifier: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `UPDATE public."Match"
       SET "homeScore" = COALESCE($2, "homeScore"),
           "awayScore" = COALESCE($3, "awayScore"),
           "isFinished" = COALESCE($4, "isFinished"),
           "location" = CASE WHEN $5::text IS NULL AND $7 = false THEN "location" ELSE $5::text END,
           "date" = CASE WHEN $6::timestamp IS NULL AND $8 = false THEN "date" ELSE $6::timestamp END
       WHERE "id" = $1
       RETURNING "id", "tournamentId", "homeTeamId", "awayTeamId", "date", "location", "homeScore", "awayScore", "isFinished", "round", "groupName", "matchLogicIdentifier", "createdAt", "updatedAt"`,
      [
        id,
        typeof body.homeScore === "number" ? body.homeScore : null,
        typeof body.awayScore === "number" ? body.awayScore : null,
        typeof body.isFinished === "boolean" ? body.isFinished : true,
        typeof body.location === "string" ? body.location.trim() || null : null,
        typeof body.date === "string" && body.date ? new Date(body.date) : body.date === null ? null : null,
        typeof body.location === "string",
        body.date !== undefined,
      ]
    );

    if (match.rowCount === 0) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    const row = match.rows[0];

    return NextResponse.json({
      id: row.id,
      tournamentId: row.tournamentId,
      homeTeamId: row.homeTeamId,
      awayTeamId: row.awayTeamId,
      date: row.date?.toISOString() ?? null,
      location: row.location,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      isFinished: row.isFinished,
      round: row.round,
      groupName: row.groupName,
      matchLogicIdentifier: row.matchLogicIdentifier,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/matches/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el partido" },
      { status: 500 }
    );
  }
}