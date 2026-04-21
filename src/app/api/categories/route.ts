import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";
import { normalizeCatalogName } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await postgres.query<{
      id: string;
      name: string;
      gender: string;
      createdAt: Date;
      updatedAt: Date;
    }>('SELECT "id", "name", "gender", "createdAt", "updatedAt" FROM public."Category" ORDER BY "createdAt" ASC');

    return NextResponse.json(
      categories.rows.map((category) => ({
        id: category.id,
        name: category.name,
        gender: category.gender,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar las categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";

    if (!name || !gender) {
      return NextResponse.json(
        { error: "Nombre y genero son requeridos" },
        { status: 400 }
      );
    }

    const existing = await postgres.query<{ name: string; gender: string }>('SELECT "name", "gender" FROM public."Category"');
    if (
      existing.rows.some(
        (item) =>
          normalizeCatalogName(item.name) === normalizeCatalogName(name) &&
          normalizeCatalogName(item.gender) === normalizeCatalogName(gender)
      )
    ) {
      return NextResponse.json({ error: "La categoria ya existe" }, { status: 409 });
    }

    const category = await postgres.query<{
      id: string;
      name: string;
      gender: string;
      createdAt: Date;
      updatedAt: Date;
    }>(
      'INSERT INTO public."Category" ("id", "name", "gender") VALUES ($1, $2, $3) RETURNING "id", "name", "gender", "createdAt", "updatedAt"',
      [crypto.randomUUID(), name, gender]
    );

    return NextResponse.json(
      {
        id: category.rows[0].id,
        name: category.rows[0].name,
        gender: category.rows[0].gender,
        createdAt: category.rows[0].createdAt.toISOString(),
        updatedAt: category.rows[0].updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear la categoria" },
      { status: 500 }
    );
  }
}