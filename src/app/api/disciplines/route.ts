import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";
import { normalizeCatalogName } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [disciplines, categories] = await Promise.all([
      postgres.query<{ id: string; name: string; createdAt: Date; updatedAt: Date }>('SELECT "id", "name", "createdAt", "updatedAt" FROM public."Discipline" ORDER BY "name" ASC'),
      postgres.query<{ id: string; name: string; gender: string; createdAt: Date; updatedAt: Date }>('SELECT "id", "name", "gender", "createdAt", "updatedAt" FROM public."Category" ORDER BY "createdAt" ASC'),
    ]);

    return NextResponse.json({
      disciplines: disciplines.rows.map((discipline) => ({
        id: discipline.id,
        name: discipline.name,
        createdAt: discipline.createdAt.toISOString(),
        updatedAt: discipline.updatedAt.toISOString(),
      })),
      categories: categories.rows.map((category) => ({
        id: category.id,
        name: category.name,
        gender: category.gender,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/disciplines failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar disciplinas y categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await postgres.query<{ name: string }>('SELECT "name" FROM public."Discipline"');
    if (existing.rows.some((item) => normalizeCatalogName(item.name) === normalizeCatalogName(name))) {
      return NextResponse.json({ error: "La disciplina ya existe" }, { status: 409 });
    }

    const discipline = await postgres.query<{ id: string; name: string; createdAt: Date; updatedAt: Date }>(
      'INSERT INTO public."Discipline" ("id", "name") VALUES ($1, $2) RETURNING "id", "name", "createdAt", "updatedAt"',
      [crypto.randomUUID(), name]
    );
    return NextResponse.json(
      {
        id: discipline.rows[0].id,
        name: discipline.rows[0].name,
        createdAt: discipline.rows[0].createdAt.toISOString(),
        updatedAt: discipline.rows[0].updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/disciplines failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear la disciplina" },
      { status: 500 }
    );
  }
}