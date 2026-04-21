import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { generateFixtureMatches, type FixtureGenerationOptions } from "@/lib/fixtureEngine";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const options = (await request.json()) as FixtureGenerationOptions;

    const [{ data: tournament }, { data: teams }, { data: matches }] = await Promise.all([
      supabase.from("Tournament").select("id").eq("id", id).single(),
      supabase.from("TournamentTeam").select("teamId, Team(id, name)").eq("tournamentId", id),
      supabase.from("Match").select("id").eq("tournamentId", id),
    ]);

    if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    if (!options.format) return NextResponse.json({ error: "Debes seleccionar el formato primero" }, { status: 400 });

    const teamRows = (teams ?? []).map((entry) => {
      const t = entry.Team as unknown as { id: string; name: string } | null;
      return { id: t?.id ?? entry.teamId, name: t?.name ?? "" };
    });

    if (teamRows.length < 2) {
      return NextResponse.json({ error: "Necesitas al menos 2 equipos para generar el fixture" }, { status: 400 });
    }
    if ((matches ?? []).length > 0) {
      return NextResponse.json({ error: "Este torneo ya tiene partidos generados" }, { status: 409 });
    }

    const fixtureMatches = generateFixtureMatches(teamRows, options);

    const matchInserts = fixtureMatches.map((match) => ({
      id: crypto.randomUUID(),
      tournamentId: id,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      round: match.round,
      groupName: match.groupName,
      matchLogicIdentifier: match.matchLogicIdentifier,
      date: match.date ?? null,
    }));

    const { error: insertError } = await supabase.from("Match").insert(matchInserts);
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from("Tournament")
      .update({ status: "PLAYING", format: options.format })
      .eq("id", id);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, count: fixtureMatches.length });
  } catch (error) {
    console.error("POST /api/tournaments/[id]/fixture/generate failed:", error);
    return NextResponse.json({ error: "No se pudo generar el fixture" }, { status: 500 });
  }
}
