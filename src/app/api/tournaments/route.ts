import { NextRequest, NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const tournaments = await postgres.query<{
      id: string;
      name: string;
      format: string | null;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      disciplineId: string;
      disciplineName: string;
      categoryId: string;
      categoryName: string;
      categoryGender: string;
      teamsCount: number;
      matchesCount: number;
    }>(
      `SELECT
        t."id", t."name", t."format", t."status", t."createdAt", t."updatedAt",
        d."id" AS "disciplineId", d."name" AS "disciplineName",
        c."id" AS "categoryId", c."name" AS "categoryName", c."gender" AS "categoryGender",
        COUNT(DISTINCT tt."id")::int AS "teamsCount",
        COUNT(DISTINCT m."id")::int AS "matchesCount"
      FROM public."Tournament" t
      INNER JOIN public."Discipline" d ON d."id" = t."disciplineId"
      INNER JOIN public."Category" c ON c."id" = t."categoryId"
      LEFT JOIN public."TournamentTeam" tt ON tt."tournamentId" = t."id"
      LEFT JOIN public."Match" m ON m."tournamentId" = t."id"
      WHERE ($1 = '' OR t."name" ILIKE '%' || $1 || '%')
      GROUP BY t."id", d."id", c."id"
      ORDER BY t."createdAt" DESC`,
      [query]
    );

    return NextResponse.json(
      tournaments.rows.map((tournament) => ({
        id: tournament.id,
        name: tournament.name,
        format: tournament.format,
        status: tournament.status,
        discipline: { id: tournament.disciplineId, name: tournament.disciplineName },
        category: { id: tournament.categoryId, name: tournament.categoryName, gender: tournament.categoryGender },
        teamsCount: tournament.teamsCount,
        matchesCount: tournament.matchesCount,
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

    const tournament = await postgres.query<{
      id: string;
      name: string;
      format: string | null;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      disciplineId: string;
      disciplineName: string;
      categoryId: string;
      categoryName: string;
      categoryGender: string;
    }>(
      `INSERT INTO public."Tournament" ("id", "name", "disciplineId", "categoryId")
       VALUES ($1, $2, $3, $4)
       RETURNING "id", "name", "format", "status", "createdAt", "updatedAt",
         "disciplineId" AS "disciplineId",
         (SELECT d."name" FROM public."Discipline" d WHERE d."id" = $3) AS "disciplineName",
         "categoryId" AS "categoryId",
         (SELECT c."name" FROM public."Category" c WHERE c."id" = $4) AS "categoryName",
         (SELECT c."gender" FROM public."Category" c WHERE c."id" = $4) AS "categoryGender"`,
      [crypto.randomUUID(), name, disciplineId, categoryId]
    );

    const row = tournament.rows[0];

    return NextResponse.json(
      {
        id: row.id,
        name: row.name,
        format: row.format,
        status: row.status,
        discipline: { id: row.disciplineId, name: row.disciplineName },
        category: { id: row.categoryId, name: row.categoryName, gender: row.categoryGender },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
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