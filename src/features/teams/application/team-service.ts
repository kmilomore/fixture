import { getSupabase } from "@/infrastructure/supabase/client";

export type TeamListItem = {
  id: string;
  name: string;
  establishmentId: string;
  establishment: { id: string; name: string; comuna: string | null };
  createdAt: string;
  updatedAt: string;
};

export async function listTeams(input?: { q?: string; establishmentId?: string }) {
  const supabase = getSupabase();
  const q = input?.q?.trim() ?? "";
  const establishmentId = input?.establishmentId?.trim() ?? "";

  let query = supabase
    .from("Team")
    .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
    .order("createdAt", { ascending: false });

  if (establishmentId) {
    query = query.eq("establishmentId", establishmentId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  let rows = data ?? [];
  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter(
      (team) =>
        team.name.toLowerCase().includes(lower) ||
        ((team.Establishment as unknown as { name: string } | null)?.name.toLowerCase().includes(lower) ?? false)
    );
  }

  return rows.map((team) => {
    const establishment = team.Establishment as unknown as { id: string; name: string; comuna: string | null } | null;
    return {
      id: team.id,
      name: team.name,
      establishmentId: team.establishmentId,
      establishment: {
        id: establishment?.id ?? team.establishmentId,
        name: establishment?.name ?? "",
        comuna: establishment?.comuna ?? null,
      },
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    } satisfies TeamListItem;
  });
}