import { NextRequest, NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const establishmentId = request.nextUrl.searchParams.get("establishmentId")?.trim() ?? "";

    const teams = await postgres.query<{
      id: string;
      name: string;
      establishmentId: string;
      createdAt: Date;
      updatedAt: Date;
      establishmentName: string;
      establishmentComuna: string | null;
    }>(
      `SELECT
        t."id",
        t."name",
        t."establishmentId",
        t."createdAt",
        t."updatedAt",
        e."name" AS "establishmentName",
        e."comuna" AS "establishmentComuna"
      FROM public."Team" t
      INNER JOIN public."Establishment" e ON e."id" = t."establishmentId"
      WHERE ($1 = '' OR (t."name" ILIKE '%' || $1 || '%' OR e."name" ILIKE '%' || $1 || '%'))
        AND ($2 = '' OR t."establishmentId" = $2)
      ORDER BY t."createdAt" DESC`,
      [query, establishmentId]
    );

    return NextResponse.json(
      teams.rows.map((team) => ({
        id: team.id,
        name: team.name,
        establishmentId: team.establishmentId,
        establishment: {
          id: team.establishmentId,
          name: team.establishmentName,
          comuna: team.establishmentComuna,
        },
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/teams failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los equipos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const establishmentId = typeof body.establishmentId === "string" ? body.establishmentId.trim() : "";

    if (!name || !establishmentId) {
      return NextResponse.json(
        { error: "Nombre y establecimiento son requeridos" },
        { status: 400 }
      );
    }

    const team = await postgres.query<{
      id: string;
      name: string;
      establishmentId: string;
      createdAt: Date;
      updatedAt: Date;
      establishmentName: string;
      establishmentComuna: string | null;
    }>(
      `INSERT INTO public."Team" ("id", "name", "establishmentId")
       VALUES ($1, $2, $3)
       RETURNING "id", "name", "establishmentId", "createdAt", "updatedAt",
         (SELECT e."name" FROM public."Establishment" e WHERE e."id" = $3) AS "establishmentName",
         (SELECT e."comuna" FROM public."Establishment" e WHERE e."id" = $3) AS "establishmentComuna"`,
      [crypto.randomUUID(), name, establishmentId]
    );

    const row = team.rows[0];

    return NextResponse.json(
      {
        id: row.id,
        name: row.name,
        establishmentId: row.establishmentId,
        establishment: {
          id: row.establishmentId,
          name: row.establishmentName,
          comuna: row.establishmentComuna,
        },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/teams failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear el equipo" },
      { status: 500 }
    );
  }
}