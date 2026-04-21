import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await postgres.query<{
      id: string;
      name: string;
      gender: string;
      createdAt: Date;
      updatedAt: Date;
    }>('SELECT "id", "name", "gender", "createdAt", "updatedAt" FROM public."Category" WHERE "id" = $1', [id]);

    if (category.rowCount === 0) {
      return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    }

    const row = category.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      gender: row.gender,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/categories/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la categoria" },
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
    const gender = typeof body.gender === "string" && body.gender.trim() ? body.gender.trim() : null;
    const category = await postgres.query<{
      id: string;
      name: string;
      gender: string;
      createdAt: Date;
      updatedAt: Date;
    }>(
      'UPDATE public."Category" SET "name" = COALESCE($2, "name"), "gender" = COALESCE($3, "gender") WHERE "id" = $1 RETURNING "id", "name", "gender", "createdAt", "updatedAt"',
      [id, name, gender]
    );

    if (category.rowCount === 0) {
      return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    }

    const row = category.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      gender: row.gender,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/categories/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la categoria" },
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
    const result = await postgres.query('DELETE FROM public."Category" WHERE "id" = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la categoria" },
      { status: 500 }
    );
  }
}