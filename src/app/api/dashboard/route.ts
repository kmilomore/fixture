import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [establishments, teams, tournaments, matches] = await Promise.all([
      prisma.establishment.count(),
      prisma.team.count(),
      prisma.tournament.count(),
      prisma.match.count(),
    ]);

    return NextResponse.json({
      establishments,
      teams,
      tournaments,
      matches,
    });
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el dashboard" },
      { status: 500 }
    );
  }
}