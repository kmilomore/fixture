import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await postgres.query('DELETE FROM public."Match" WHERE "tournamentId" = $1', [id]);
    await postgres.query('UPDATE public."Tournament" SET "status" = $2, "format" = NULL WHERE "id" = $1', [id, "DRAFT"]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/tournaments/[id]/fixture/reset failed:", error);
    return NextResponse.json(
      { error: "No se pudo reiniciar el fixture" },
      { status: 500 }
    );
  }
}