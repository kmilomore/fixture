import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { DEFAULT_SCHEDULING_RULES, deriveTournamentStatus, schedulingRulesFromRow, schedulingRulesToRow } from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    let query = supabase
      .from("Tournament")
      .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender), TournamentTeam(id), Match(id)")
      .order("createdAt", { ascending: false });

    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      (data ?? []).map((t) => {
        const disc = t.Discipline as unknown as { id: string; name: string } | null;
        const cat = t.Category as unknown as { id: string; name: string; gender: string } | null;
        return {
          id: t.id,
          name: t.name,
          format: t.format,
          status: deriveTournamentStatus({
            teamCount: Array.isArray(t.TournamentTeam) ? t.TournamentTeam.length : 0,
            matchCount: Array.isArray(t.Match) ? t.Match.length : 0,
            format: t.format,
            status: t.status,
          }),
          schedulingRules: schedulingRulesFromRow(t),
          discipline: { id: disc?.id ?? "", name: disc?.name ?? "" },
          category: { id: cat?.id ?? "", name: cat?.name ?? "", gender: cat?.gender ?? "" },
          teamsCount: Array.isArray(t.TournamentTeam) ? t.TournamentTeam.length : 0,
          matchesCount: Array.isArray(t.Match) ? t.Match.length : 0,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        };
      })
    );
  } catch (error) {
    console.error("GET /api/tournaments failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los torneos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const disciplineId = typeof body.disciplineId === "string" ? body.disciplineId.trim() : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";

    if (!name || !disciplineId || !categoryId) {
      return NextResponse.json({ error: "Nombre, disciplina y categoria son obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Tournament")
      .insert({ id: crypto.randomUUID(), name, disciplineId, categoryId, ...schedulingRulesToRow(DEFAULT_SCHEDULING_RULES) })
      .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)")
      .single();

    if (error) throw error;

    const disc = data.Discipline as unknown as { id: string; name: string } | null;
    const cat = data.Category as unknown as { id: string; name: string; gender: string } | null;
    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        format: data.format,
        status: data.status,
        schedulingRules: schedulingRulesFromRow(data),
        discipline: { id: disc?.id ?? "", name: disc?.name ?? "" },
        category: { id: cat?.id ?? "", name: cat?.name ?? "", gender: cat?.gender ?? "" },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tournaments failed:", error);
    return NextResponse.json({ error: "No se pudo crear el torneo" }, { status: 500 });
  }
}
