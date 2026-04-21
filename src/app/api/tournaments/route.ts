import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { DEFAULT_SCHEDULING_RULES, deriveTournamentStatus, isTournamentStatus, schedulingRulesFromRow, schedulingRulesToRow } from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

const TOURNAMENT_SELECT = "id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender), TournamentTeam(id), Match(id)";
const TOURNAMENT_LEGACY_SELECT = "id, name, format, status, createdAt, updatedAt, Discipline(id, name), Category(id, name, gender), TournamentTeam(id), Match(id)";

function hasMissingTournamentScheduleColumns(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return false;
  }

  const message = String(error.message).toLowerCase();
  return message.includes("schedulestartdate") || message.includes("scheduleenddate") || message.includes("schedulematchespermatchday");
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const buildQuery = (selectClause: string) => {
      let query = supabase
        .from("Tournament")
        .select(selectClause)
        .order("createdAt", { ascending: false });

      if (q) query = query.ilike("name", `%${q}%`);
      return query;
    };

    let { data, error } = await buildQuery(TOURNAMENT_SELECT);

    if (error && hasMissingTournamentScheduleColumns(error)) {
      const fallback = await buildQuery(TOURNAMENT_LEGACY_SELECT);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;

    return NextResponse.json(
      (data ?? []).map((t) => {
        const tournamentRow = t as unknown as Record<string, unknown> & {
          id: string;
          name: string;
          format: string | null;
          status: string;
          createdAt: string;
          updatedAt: string;
          scheduleStartDate?: string | null;
          scheduleEndDate?: string | null;
          scheduleMatchesPerMatchday?: number | null;
          scheduleAllowedWeekdays?: number[] | null;
          scheduleDailyStartTime?: string | null;
          scheduleDailyEndTime?: string | null;
          scheduleMatchDurationMinutes?: number | null;
          Discipline?: unknown;
          Category?: unknown;
          TournamentTeam?: Array<unknown>;
          Match?: Array<unknown>;
        };
        const disc = tournamentRow.Discipline as unknown as { id: string; name: string } | null;
        const cat = tournamentRow.Category as unknown as { id: string; name: string; gender: string } | null;
        const normalizedTournamentStatus = isTournamentStatus(tournamentRow.status) ? tournamentRow.status : "DRAFT";
        return {
          id: tournamentRow.id,
          name: tournamentRow.name,
          format: tournamentRow.format,
          status: deriveTournamentStatus({
            teamCount: Array.isArray(tournamentRow.TournamentTeam) ? tournamentRow.TournamentTeam.length : 0,
            matchCount: Array.isArray(tournamentRow.Match) ? tournamentRow.Match.length : 0,
            format: tournamentRow.format,
            status: normalizedTournamentStatus,
          }),
          schedulingRules: schedulingRulesFromRow(tournamentRow),
          discipline: { id: disc?.id ?? "", name: disc?.name ?? "" },
          category: { id: cat?.id ?? "", name: cat?.name ?? "", gender: cat?.gender ?? "" },
          teamsCount: Array.isArray(tournamentRow.TournamentTeam) ? tournamentRow.TournamentTeam.length : 0,
          matchesCount: Array.isArray(tournamentRow.Match) ? tournamentRow.Match.length : 0,
          createdAt: tournamentRow.createdAt,
          updatedAt: tournamentRow.updatedAt,
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

    const primaryInsert = await supabase
      .from("Tournament")
      .insert({ id: crypto.randomUUID(), name, disciplineId, categoryId, ...schedulingRulesToRow(DEFAULT_SCHEDULING_RULES) })
      .select("id, name, format, status, createdAt, updatedAt, scheduleStartDate, scheduleEndDate, scheduleMatchesPerMatchday, scheduleAllowedWeekdays, scheduleDailyStartTime, scheduleDailyEndTime, scheduleMatchDurationMinutes, Discipline(id, name), Category(id, name, gender)")
      .single();

    let data: unknown = primaryInsert.data;
    let error: unknown = primaryInsert.error;

    if (error && hasMissingTournamentScheduleColumns(error)) {
      const fallback = await supabase
        .from("Tournament")
        .insert({ id: crypto.randomUUID(), name, disciplineId, categoryId })
        .select("id, name, format, status, createdAt, updatedAt, Discipline(id, name), Category(id, name, gender)")
        .single();

      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;

    const tournamentRow = data as unknown as Record<string, unknown> & {
      id: string;
      name: string;
      format: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
      scheduleStartDate?: string | null;
      scheduleEndDate?: string | null;
      scheduleMatchesPerMatchday?: number | null;
      scheduleAllowedWeekdays?: number[] | null;
      scheduleDailyStartTime?: string | null;
      scheduleDailyEndTime?: string | null;
      scheduleMatchDurationMinutes?: number | null;
      Discipline?: unknown;
      Category?: unknown;
    };

    const disc = tournamentRow.Discipline as unknown as { id: string; name: string } | null;
    const cat = tournamentRow.Category as unknown as { id: string; name: string; gender: string } | null;
    return NextResponse.json(
      {
        id: tournamentRow.id,
        name: tournamentRow.name,
        format: tournamentRow.format,
        status: tournamentRow.status,
        schedulingRules: schedulingRulesFromRow(tournamentRow),
        discipline: { id: disc?.id ?? "", name: disc?.name ?? "" },
        category: { id: cat?.id ?? "", name: cat?.name ?? "", gender: cat?.gender ?? "" },
        createdAt: tournamentRow.createdAt,
        updatedAt: tournamentRow.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tournaments failed:", error);
    return NextResponse.json({ error: "No se pudo crear el torneo" }, { status: 500 });
  }
}
