import { NextRequest, NextResponse } from "next/server";
import postgres from "@/lib/postgres";
import { normalizeComuna, normalizeEstablishmentName } from "@/lib/establishments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const comuna = request.nextUrl.searchParams.get("comuna")?.trim() ?? "";

    const establishments = await postgres.query<{
      id: string;
      name: string;
      comuna: string | null;
      createdAt: Date;
      updatedAt: Date;
      teamsCount: number;
    }>(
      `SELECT
        e."id",
        e."name",
        e."comuna",
        e."createdAt",
        e."updatedAt",
        COUNT(t."id")::int AS "teamsCount"
      FROM public."Establishment" e
      LEFT JOIN public."Team" t ON t."establishmentId" = e."id"
      WHERE ($1 = '' OR e."name" ILIKE '%' || $1 || '%')
        AND ($2 = '' OR COALESCE(e."comuna", '') ILIKE $2)
      GROUP BY e."id", e."name", e."comuna", e."createdAt", e."updatedAt"
      ORDER BY e."name" ASC`,
      [query, comuna]
    );

    return NextResponse.json(
      establishments.rows.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        comuna: establishment.comuna,
        teamsCount: establishment.teamsCount,
        createdAt: establishment.createdAt.toISOString(),
        updatedAt: establishment.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/establishments failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los establecimientos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const comuna = normalizeComuna(body.comuna);
    const logoUrl = typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await postgres.query<{ name: string }>('SELECT "name" FROM public."Establishment"');
    if (existing.rows.some((row) => normalizeEstablishmentName(row.name) === normalizeEstablishmentName(name))) {
      return NextResponse.json({ error: "El establecimiento ya existe" }, { status: 409 });
    }

    const establishmentId = crypto.randomUUID();
    const establishment = await postgres.query<{
      id: string;
      name: string;
      comuna: string | null;
      logoUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>(
      'INSERT INTO public."Establishment" ("id", "name", "comuna", "logoUrl") VALUES ($1, $2, $3, $4) RETURNING "id", "name", "comuna", "logoUrl", "createdAt", "updatedAt"',
      [establishmentId, name, comuna, logoUrl]
    );
    await postgres.query(
      'INSERT INTO public."Team" ("id", "name", "establishmentId") VALUES ($1, $2, $3)',
      [crypto.randomUUID(), name, establishmentId]
    );

    const row = establishment.rows[0];
    return NextResponse.json(
      {
        id: row.id,
        name: row.name,
        comuna: row.comuna,
        logoUrl: row.logoUrl,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/establishments failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear el establecimiento" },
      { status: 500 }
    );
  }
}