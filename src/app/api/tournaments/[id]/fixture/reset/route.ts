import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.match.deleteMany({ where: { tournamentId: id } });
    await prisma.tournament.update({
      where: { id },
      data: { status: "DRAFT", format: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/tournaments/[id]/fixture/reset failed:", error);
    return NextResponse.json(
      { error: "No se pudo reiniciar el fixture" },
      { status: 500 }
    );
  }
}