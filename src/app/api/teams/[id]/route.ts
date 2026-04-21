import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await postgres.query<{
      id: string;
      name: string;
      establishmentId: string;
      createdAt: Date;
      updatedAt: Date;
      establishmentName: string;
      establishmentComuna: string | null;
    }>(
      `SELECT
        t."id", t."name", t."establishmentId", t."createdAt", t."updatedAt",
        e."name" AS "establishmentName", e."comuna" AS "establishmentComuna"
      FROM public."Team" t
      INNER JOIN public."Establishment" e ON e."id" = t."establishmentId"
      WHERE t."id" = $1`,
      [id]
    );

    if (team.rowCount === 0) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    const row = team.rows[0];
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("GET /api/teams/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el equipo" },
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
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
    const establishmentId = typeof body.establishmentId === "string" && body.establishmentId.trim()
      ? body.establishmentId.trim()
      : null;
    const team = await postgres.query<{
      id: string;
      name: string;
      establishmentId: string;
      createdAt: Date;
      updatedAt: Date;
      establishmentName: string;
      establishmentComuna: string | null;
    }>(
      `UPDATE public."Team"
       SET "name" = COALESCE($2, "name"),
           "establishmentId" = COALESCE($3, "establishmentId")
       WHERE "id" = $1
       RETURNING "id", "name", "establishmentId", "createdAt", "updatedAt",
         (SELECT e."name" FROM public."Establishment" e WHERE e."id" = public."Team"."establishmentId") AS "establishmentName",
         (SELECT e."comuna" FROM public."Establishment" e WHERE e."id" = public."Team"."establishmentId") AS "establishmentComuna"`,
      [id, name, establishmentId]
    );

    if (team.rowCount === 0) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    const row = team.rows[0];
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("PATCH /api/teams/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el equipo" },
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
    const result = await postgres.query('DELETE FROM public."Team" WHERE "id" = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teams/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el equipo" },
      { status: 500 }
    );
  }
}