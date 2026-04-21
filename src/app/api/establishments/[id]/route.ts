import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";
import { normalizeComuna } from "@/lib/establishments";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const establishment = await postgres.query<{
      id: string;
      name: string;
      comuna: string | null;
      logoUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      teamsCount: number;
    }>(
      `SELECT e."id", e."name", e."comuna", e."logoUrl", e."createdAt", e."updatedAt", COUNT(t."id")::int AS "teamsCount"
       FROM public."Establishment" e
       LEFT JOIN public."Team" t ON t."establishmentId" = e."id"
       WHERE e."id" = $1
       GROUP BY e."id", e."name", e."comuna", e."logoUrl", e."createdAt", e."updatedAt"`,
      [id]
    );

    if (establishment.rowCount === 0) {
      return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });
    }

    const row = establishment.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      comuna: row.comuna,
      logoUrl: row.logoUrl,
      teamsCount: row.teamsCount,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/establishments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el establecimiento" },
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
    const comuna = body.comuna === undefined ? undefined : normalizeComuna(body.comuna);
    const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() || null : undefined;
    const establishment = await postgres.query<{
      id: string;
      name: string;
      comuna: string | null;
      logoUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `UPDATE public."Establishment"
       SET "name" = COALESCE($2, "name"),
           "comuna" = CASE WHEN $3::text IS NULL AND $6 = false THEN "comuna" ELSE $3::text END,
           "logoUrl" = CASE WHEN $4::text IS NULL AND $7 = false THEN "logoUrl" ELSE $4::text END
       WHERE "id" = $1
       RETURNING "id", "name", "comuna", "logoUrl", "createdAt", "updatedAt"`,
      [id, name, comuna ?? null, logoUrl ?? null, null, comuna !== undefined, logoUrl !== undefined]
    );

    if (establishment.rowCount === 0) {
      return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });
    }

    const row = establishment.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      comuna: row.comuna,
      logoUrl: row.logoUrl,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/establishments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el establecimiento" },
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
    const result = await postgres.query('DELETE FROM public."Establishment" WHERE "id" = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/establishments/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el establecimiento" },
      { status: 500 }
    );
  }
}