import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [tournamentResult, teamsResult, matchesResult] = await Promise.all([
      postgres.query<{
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
        `SELECT t."id", t."name", t."format", t."status", t."createdAt", t."updatedAt",
           d."id" AS "disciplineId", d."name" AS "disciplineName",
           c."id" AS "categoryId", c."name" AS "categoryName", c."gender" AS "categoryGender"
         FROM public."Tournament" t
         INNER JOIN public."Discipline" d ON d."id" = t."disciplineId"
         INNER JOIN public."Category" c ON c."id" = t."categoryId"
         WHERE t."id" = $1`,
        [id]
      ),
      postgres.query<{
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
           t."name" AS "teamName", t."establishmentId",
           e."name" AS "establishmentName", e."comuna" AS "establishmentComuna",
           t."createdAt" AS "teamCreatedAt", t."updatedAt" AS "teamUpdatedAt"
         FROM public."TournamentTeam" tt
         INNER JOIN public."Team" t ON t."id" = tt."teamId"
         INNER JOIN public."Establishment" e ON e."id" = t."establishmentId"
         WHERE tt."tournamentId" = $1`,
        [id]
      ),
      postgres.query<{
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
        homeTeamName: string | null;
        homeEstablishmentId: string | null;
        homeEstablishmentName: string | null;
        homeEstablishmentComuna: string | null;
        homeTeamCreatedAt: Date | null;
        homeTeamUpdatedAt: Date | null;
        awayTeamName: string | null;
        awayEstablishmentId: string | null;
        awayEstablishmentName: string | null;
        awayEstablishmentComuna: string | null;
        awayTeamCreatedAt: Date | null;
        awayTeamUpdatedAt: Date | null;
      }>(
        `SELECT m."id", m."tournamentId", m."homeTeamId", m."awayTeamId", m."date", m."location", m."homeScore", m."awayScore",
           m."isFinished", m."round", m."groupName", m."matchLogicIdentifier", m."createdAt", m."updatedAt",
           ht."name" AS "homeTeamName", ht."establishmentId" AS "homeEstablishmentId", he."name" AS "homeEstablishmentName",
           he."comuna" AS "homeEstablishmentComuna", ht."createdAt" AS "homeTeamCreatedAt", ht."updatedAt" AS "homeTeamUpdatedAt",
           at."name" AS "awayTeamName", at."establishmentId" AS "awayEstablishmentId", ae."name" AS "awayEstablishmentName",
           ae."comuna" AS "awayEstablishmentComuna", at."createdAt" AS "awayTeamCreatedAt", at."updatedAt" AS "awayTeamUpdatedAt"
         FROM public."Match" m
         LEFT JOIN public."Team" ht ON ht."id" = m."homeTeamId"
         LEFT JOIN public."Establishment" he ON he."id" = ht."establishmentId"
         LEFT JOIN public."Team" at ON at."id" = m."awayTeamId"
         LEFT JOIN public."Establishment" ae ON ae."id" = at."establishmentId"
         WHERE m."tournamentId" = $1
         ORDER BY m."round" ASC NULLS LAST, m."createdAt" ASC`,
        [id]
      ),
    ]);

    if (tournamentResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 }
      );
    }

    const tournament = tournamentResult.rows[0];

    return NextResponse.json({
      id: tournament.id,
      name: tournament.name,
      format: tournament.format,
      status: tournament.status,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
      discipline: { id: tournament.disciplineId, name: tournament.disciplineName },
      category: { id: tournament.categoryId, name: tournament.categoryName, gender: tournament.categoryGender },
      teams: teamsResult.rows.map((entry) => ({
        id: entry.id,
        tournamentId: entry.tournamentId,
        teamId: entry.teamId,
        team: {
          id: entry.teamId,
          name: entry.teamName,
          establishmentId: entry.establishmentId,
          establishment: {
            id: entry.establishmentId,
            name: entry.establishmentName,
            comuna: entry.establishmentComuna,
          },
          createdAt: entry.teamCreatedAt.toISOString(),
          updatedAt: entry.teamUpdatedAt.toISOString(),
        },
      })),
      matches: matchesResult.rows.map((match) => ({
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
        homeTeam: match.homeTeamId && match.homeTeamName
          ? {
              id: match.homeTeamId,
              name: match.homeTeamName,
              establishmentId: match.homeEstablishmentId!,
              establishment: {
                id: match.homeEstablishmentId!,
                name: match.homeEstablishmentName!,
                comuna: match.homeEstablishmentComuna,
              },
              createdAt: match.homeTeamCreatedAt!.toISOString(),
              updatedAt: match.homeTeamUpdatedAt!.toISOString(),
            }
          : null,
        awayTeam: match.awayTeamId && match.awayTeamName
          ? {
              id: match.awayTeamId,
              name: match.awayTeamName,
              establishmentId: match.awayEstablishmentId!,
              establishment: {
                id: match.awayEstablishmentId!,
                name: match.awayEstablishmentName!,
                comuna: match.awayEstablishmentComuna,
              },
              createdAt: match.awayTeamCreatedAt!.toISOString(),
              updatedAt: match.awayTeamUpdatedAt!.toISOString(),
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

    const updates: string[] = [];
    const values: Array<string | null> = [id];
    let index = 2;

    if (data.name !== undefined) {
      updates.push(`"name" = $${index++}`);
      values.push(data.name);
    }
    if (data.disciplineId !== undefined) {
      updates.push(`"disciplineId" = $${index++}`);
      values.push(data.disciplineId);
    }
    if (data.categoryId !== undefined) {
      updates.push(`"categoryId" = $${index++}`);
      values.push(data.categoryId);
    }
    if (Object.prototype.hasOwnProperty.call(data, "format")) {
      updates.push(`"format" = $${index++}`);
      values.push(data.format ?? null);
    }
    if (data.status !== undefined) {
      updates.push(`"status" = $${index++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay cambios para aplicar" }, { status: 400 });
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
      `UPDATE public."Tournament"
       SET ${updates.join(", ")}
       WHERE "id" = $1
       RETURNING "id", "name", "format", "status", "createdAt", "updatedAt",
         "disciplineId" AS "disciplineId",
         (SELECT d."name" FROM public."Discipline" d WHERE d."id" = public."Tournament"."disciplineId") AS "disciplineName",
         "categoryId" AS "categoryId",
         (SELECT c."name" FROM public."Category" c WHERE c."id" = public."Tournament"."categoryId") AS "categoryName",
         (SELECT c."gender" FROM public."Category" c WHERE c."id" = public."Tournament"."categoryId") AS "categoryGender"`,
      values
    );

    if (tournament.rowCount === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    const row = tournament.rows[0];

    return NextResponse.json({
      id: row.id,
      name: row.name,
      format: row.format,
      status: row.status,
      discipline: { id: row.disciplineId, name: row.disciplineName },
      category: { id: row.categoryId, name: row.categoryName, gender: row.categoryGender },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
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
    const result = await postgres.query('DELETE FROM public."Tournament" WHERE "id" = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el torneo" },
      { status: 500 }
    );
  }
}