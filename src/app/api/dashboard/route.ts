import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [establishmentsResult, teamsResult, tournamentsResult, matchesResult] = await Promise.all([
      postgres.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM public."Establishment"'),
      postgres.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM public."Team"'),
      postgres.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM public."Tournament"'),
      postgres.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM public."Match"'),
    ]);

    const establishments = Number(establishmentsResult.rows[0]?.count ?? 0);
    const teams = Number(teamsResult.rows[0]?.count ?? 0);
    const tournaments = Number(tournamentsResult.rows[0]?.count ?? 0);
    const matches = Number(matchesResult.rows[0]?.count ?? 0);

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