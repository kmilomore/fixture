import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";
import type { FixtureFormat } from "@/lib/fixtureEngine";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const format = body.format as FixtureFormat | undefined;

    if (!format) {
      return NextResponse.json({ error: "El formato es requerido" }, { status: 400 });
    }

    const tournament = await postgres.query<{ id: string; format: string | null; status: string }>(
      'UPDATE public."Tournament" SET "format" = $2, "status" = $3 WHERE "id" = $1 RETURNING "id", "format", "status"',
      [id, format, "DRAFT"]
    );

    if (tournament.rowCount === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: tournament.rows[0].id,
      format: tournament.rows[0].format,
      status: tournament.rows[0].status,
    });
  } catch (error) {
    console.error("PUT /api/tournaments/[id]/fixture/format failed:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el formato del fixture" },
      { status: 500 }
    );
  }
}