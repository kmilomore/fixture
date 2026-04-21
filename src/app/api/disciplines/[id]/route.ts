import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discipline = await postgres.query<{ id: string; name: string; createdAt: Date; updatedAt: Date }>(
      'SELECT "id", "name", "createdAt", "updatedAt" FROM public."Discipline" WHERE "id" = $1',
      [id]
    );

    if (discipline.rowCount === 0) {
      return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    }

    const row = discipline.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/disciplines/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disciplina" },
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
    const discipline = await postgres.query<{ id: string; name: string; createdAt: Date; updatedAt: Date }>(
      'UPDATE public."Discipline" SET "name" = COALESCE($2, "name") WHERE "id" = $1 RETURNING "id", "name", "createdAt", "updatedAt"',
      [id, name]
    );

    if (discipline.rowCount === 0) {
      return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    }

    const row = discipline.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH /api/disciplines/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la disciplina" },
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
    const result = await postgres.query('DELETE FROM public."Discipline" WHERE "id" = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/disciplines/[id] failed:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la disciplina" },
      { status: 500 }
    );
  }
}