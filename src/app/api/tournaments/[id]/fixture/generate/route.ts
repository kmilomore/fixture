import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";
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

    const [tournament, teams, matches] = await Promise.all([
      postgres.query<{ id: string }>('SELECT "id" FROM public."Tournament" WHERE "id" = $1', [id]),
      postgres.query<{ id: string; name: string }>(
        `SELECT t."id", t."name"
         FROM public."TournamentTeam" tt
         INNER JOIN public."Team" t ON t."id" = tt."teamId"
         WHERE tt."tournamentId" = $1`,
        [id]
      ),
      postgres.query<{ id: string }>('SELECT "id" FROM public."Match" WHERE "tournamentId" = $1', [id]),
    ]);

    if (tournament.rowCount === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    if (!options.format) {
      return NextResponse.json({ error: "Debes seleccionar el formato primero" }, { status: 400 });
    }

    if (teams.rows.length < 2) {
      return NextResponse.json(
        { error: "Necesitas al menos 2 equipos para generar el fixture" },
        { status: 400 }
      );
    }

    if (matches.rows.length > 0) {
      return NextResponse.json(
        { error: "Este torneo ya tiene partidos generados" },
        { status: 409 }
      );
    }

    const fixtureMatches = generateFixtureMatches(teams.rows, options);

    for (const match of fixtureMatches) {
      await postgres.query(
        `INSERT INTO public."Match" ("id", "tournamentId", "homeTeamId", "awayTeamId", "round", "groupName", "matchLogicIdentifier", "date")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          crypto.randomUUID(),
          id,
          match.homeTeamId,
          match.awayTeamId,
          match.round,
          match.groupName,
          match.matchLogicIdentifier,
          match.date ?? null,
        ]
      );
    }

    await postgres.query(
      'UPDATE public."Tournament" SET "status" = $2, "format" = $3 WHERE "id" = $1',
      [id, "PLAYING", options.format]
    );

    return NextResponse.json({ success: true, count: fixtureMatches.length });
  } catch (error) {
    console.error("POST /api/tournaments/[id]/fixture/generate failed:", error);
    return NextResponse.json(
      { error: "No se pudo generar el fixture" },
      { status: 500 }
    );
  }
}