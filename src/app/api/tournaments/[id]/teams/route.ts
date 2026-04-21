import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { deriveTournamentStatus } from "@/lib/tournamentLifecycle";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { data, error } = await supabase
      .from("TournamentTeam")
      .select("id, tournamentId, teamId, Team(id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna))")
      .eq("tournamentId", id);

    if (error) throw error;

    return NextResponse.json(
      (data ?? []).map((entry) => {
        const t = entry.Team as unknown as { id: string; name: string; establishmentId: string; createdAt: string; updatedAt: string; Establishment: { id: string; name: string; comuna: string | null } | null } | null;
        return {
          id: entry.id,
          tournamentId: entry.tournamentId,
          teamId: entry.teamId,
          team: {
            id: t?.id ?? entry.teamId,
            name: t?.name ?? "",
            establishmentId: t?.establishmentId ?? "",
            establishment: { id: t?.Establishment?.id ?? "", name: t?.Establishment?.name ?? "", comuna: t?.Establishment?.comuna ?? null },
            createdAt: t?.createdAt ?? "",
            updatedAt: t?.updatedAt ?? "",
          },
        };
      })
    );
  } catch (error) {
    console.error("GET /api/tournaments/[id]/teams failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los equipos del torneo" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    const teamId = typeof body.teamId === "string" ? body.teamId.trim() : "";

    if (!teamId) return NextResponse.json({ error: "teamId es requerido" }, { status: 400 });

    const [{ data: tournament }, { data: matches }] = await Promise.all([
      supabase.from("Tournament").select("id, format, status").eq("id", id).single(),
      supabase.from("Match").select("id").eq("tournamentId", id).limit(1),
    ]);

    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    if ((matches ?? []).length > 0) {
      return NextResponse.json({ error: "No puedes modificar equipos cuando el fixture ya fue generado" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("TournamentTeam")
      .insert({ id: crypto.randomUUID(), tournamentId: id, teamId })
      .select("id, tournamentId, teamId, Team(id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna))")
      .single();

    if (error) throw error;

    const { count: teamCount } = await supabase
      .from("TournamentTeam")
      .select("id", { count: "exact", head: true })
      .eq("tournamentId", id);

    await supabase
      .from("Tournament")
      .update({
        status: deriveTournamentStatus({
          teamCount: teamCount ?? 0,
          matchCount: 0,
          format: tournament.format,
          status: tournament.status,
        }),
      })
      .eq("id", id);

    const t = data.Team as unknown as { id: string; name: string; establishmentId: string; createdAt: string; updatedAt: string; Establishment: { id: string; name: string; comuna: string | null } | null } | null;
    return NextResponse.json(
      {
        id: data.id,
        tournamentId: data.tournamentId,
        teamId: data.teamId,
        team: {
          id: t?.id ?? teamId,
          name: t?.name ?? "",
          establishmentId: t?.establishmentId ?? "",
          establishment: { id: t?.Establishment?.id ?? "", name: t?.Establishment?.name ?? "", comuna: t?.Establishment?.comuna ?? null },
          createdAt: t?.createdAt ?? "",
          updatedAt: t?.updatedAt ?? "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tournaments/[id]/teams failed:", error);
    return NextResponse.json({ error: "No se pudo agregar el equipo al torneo" }, { status: 500 });
  }
}
