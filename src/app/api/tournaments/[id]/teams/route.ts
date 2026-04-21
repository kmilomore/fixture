import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teams = await postgres.query<{
      id: string;
      tournamentId: string;
      teamId: string;
      teamName: string;
      establishmentId: string;
      establishmentName: string;
      establishmentComuna: string | null;
      teamCreatedAt: Date;
      teamUpdatedAt: Date;
    }>(
      `SELECT tt."id", tt."tournamentId", tt."teamId",
         t."name" AS "teamName", t."establishmentId", e."name" AS "establishmentName", e."comuna" AS "establishmentComuna",
         t."createdAt" AS "teamCreatedAt", t."updatedAt" AS "teamUpdatedAt"
       FROM public."TournamentTeam" tt
       INNER JOIN public."Team" t ON t."id" = tt."teamId"
       INNER JOIN public."Establishment" e ON e."id" = t."establishmentId"
       WHERE tt."tournamentId" = $1`,
      [id]
    );

    return NextResponse.json(
      teams.rows.map((entry) => ({
        id: entry.id,
        tournamentId: entry.tournamentId,
        teamId: entry.teamId,
        team: {
          id: entry.teamId,
          name: entry.teamName,
          establishmentId: entry.establishmentId,
          establishment: { id: entry.establishmentId, name: entry.establishmentName, comuna: entry.establishmentComuna },
          createdAt: entry.teamCreatedAt.toISOString(),
          updatedAt: entry.teamUpdatedAt.toISOString(),
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

    const entry = await postgres.query<{
      id: string;
      tournamentId: string;
      teamId: string;
      teamName: string;
      establishmentId: string;
      establishmentName: string;
      establishmentComuna: string | null;
      teamCreatedAt: Date;
      teamUpdatedAt: Date;
    }>(
      `INSERT INTO public."TournamentTeam" ("id", "tournamentId", "teamId")
       VALUES ($1, $2, $3)
       RETURNING "id", "tournamentId", "teamId",
         (SELECT t."name" FROM public."Team" t WHERE t."id" = $3) AS "teamName",
         (SELECT t."establishmentId" FROM public."Team" t WHERE t."id" = $3) AS "establishmentId",
         (SELECT e."name" FROM public."Team" t INNER JOIN public."Establishment" e ON e."id" = t."establishmentId" WHERE t."id" = $3) AS "establishmentName",
         (SELECT e."comuna" FROM public."Team" t INNER JOIN public."Establishment" e ON e."id" = t."establishmentId" WHERE t."id" = $3) AS "establishmentComuna",
         (SELECT t."createdAt" FROM public."Team" t WHERE t."id" = $3) AS "teamCreatedAt",
         (SELECT t."updatedAt" FROM public."Team" t WHERE t."id" = $3) AS "teamUpdatedAt"`,
      [crypto.randomUUID(), id, teamId]
    );

    const row = entry.rows[0];

    return NextResponse.json(
      {
        id: row.id,
        tournamentId: row.tournamentId,
        teamId: row.teamId,
        team: {
          id: row.teamId,
          name: row.teamName,
          establishmentId: row.establishmentId,
          establishment: { id: row.establishmentId, name: row.establishmentName, comuna: row.establishmentComuna },
          createdAt: row.teamCreatedAt.toISOString(),
          updatedAt: row.teamUpdatedAt.toISOString(),
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