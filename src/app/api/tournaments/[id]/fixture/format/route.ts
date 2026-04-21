import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { FixtureFormat } from "@/lib/fixtureEngine";
import { deriveTournamentStatus, schedulingRulesToRow } from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    const format = body.format as FixtureFormat | undefined;
    const schedulingRules = typeof body.schedulingRules === "object" ? body.schedulingRules : undefined;

    if (!format) return NextResponse.json({ error: "El formato es requerido" }, { status: 400 });

    const { count: teamCount } = await supabase
      .from("TournamentTeam")
      .select("id", { count: "exact", head: true })
      .eq("tournamentId", id);

    const { data, error } = await supabase
      .from("Tournament")
      .update({
        format,
        status: deriveTournamentStatus({
          teamCount: teamCount ?? 0,
          matchCount: 0,
          format,
          status: "DRAFT",
        }),
        ...schedulingRulesToRow(schedulingRules),
      })
      .eq("id", id)
      .select("id, format, status, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes")
      .single();

    if (error || !data) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT /api/tournaments/[id]/fixture/format failed:", error);
    return NextResponse.json({ error: "No se pudo guardar el formato del fixture" }, { status: 500 });
  }
}
