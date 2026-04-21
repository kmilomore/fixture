import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    const tournament = await prisma.tournament.update({
      where: { id },
      data: { format, status: "DRAFT" },
    });

    return NextResponse.json({
      id: tournament.id,
      format: tournament.format,
      status: tournament.status,
    });
  } catch (error) {
    console.error("PUT /api/tournaments/[id]/fixture/format failed:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el formato del fixture" },
      { status: 500 }
    );
  }
}