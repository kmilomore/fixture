import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabase();
    const [e, t, tour, m] = await Promise.all([
      supabase.from("Establishment").select("*", { count: "exact", head: true }),
      supabase.from("Team").select("*", { count: "exact", head: true }),
      supabase.from("Tournament").select("*", { count: "exact", head: true }),
      supabase.from("Match").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      establishments: e.count ?? 0,
      teams: t.count ?? 0,
      tournaments: tour.count ?? 0,
      matches: m.count ?? 0,
    });
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    return NextResponse.json({ error: "No se pudo consultar el dashboard" }, { status: 500 });
  }
}
