import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; teamEntryId: string }> }
) {
  try {
    const { teamEntryId } = await params;
    await prisma.tournamentTeam.delete({ where: { id: teamEntryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id]/teams/[teamEntryId] failed:", error);
    return NextResponse.json(
      { error: "No se pudo quitar el equipo del torneo" },
      { status: 500 }
    );
  }
}