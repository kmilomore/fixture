import { getSupabase } from "@/infrastructure/supabase/client";
import { ServiceError } from "@/shared/lib/service-error";

export type TeamListItem = {
  id: string;
  name: string;
  establishmentId: string;
  establishment: { id: string; name: string; comuna: string | null };
  createdAt: string;
  updatedAt: string;
};

export type TeamDetail = TeamListItem;

function mapTeam(team: {
  id: string;
  name: string;
  establishmentId: string;
  createdAt: string;
  updatedAt: string;
  Establishment?: unknown;
}) {
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
}

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

  return rows.map(mapTeam);
}

export async function getTeamDetail(id: string) {
  const supabase = getSupabase();
  const teamId = id.trim();

  if (!teamId) {
    throw new ServiceError(400, "El identificador del equipo es requerido");
  }

  const { data, error } = await supabase
    .from("Team")
    .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
    .eq("id", teamId)
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Equipo no encontrado");
  }

  return mapTeam(data);
}

export async function createTeam(input: { name: string; establishmentId: string }) {
  const supabase = getSupabase();
  const name = input.name.trim();
  const establishmentId = input.establishmentId.trim();

  if (!name || !establishmentId) {
    throw new ServiceError(400, "Nombre y establecimiento son requeridos");
  }

  const { data, error } = await supabase
    .from("Team")
    .insert({ id: crypto.randomUUID(), name, establishmentId })
    .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
    .single();

  if (error || !data) {
    throw error;
  }

  return mapTeam(data);
}

export async function updateTeam(input: { id: string; name?: string; establishmentId?: string }) {
  const supabase = getSupabase();
  const id = input.id.trim();

  if (!id) {
    throw new ServiceError(400, "El identificador del equipo es requerido");
  }

  const updateData: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updateData.name = input.name.trim();
  }
  if (typeof input.establishmentId === "string" && input.establishmentId.trim()) {
    updateData.establishmentId = input.establishmentId.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return getTeamDetail(id);
  }

  const { data, error } = await supabase
    .from("Team")
    .update(updateData)
    .eq("id", id)
    .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Equipo no encontrado");
  }

  return mapTeam(data);
}

export async function deleteTeam(id: string) {
  const supabase = getSupabase();
  const teamId = id.trim();

  if (!teamId) {
    throw new ServiceError(400, "El identificador del equipo es requerido");
  }

  const { error } = await supabase.from("Team").delete().eq("id", teamId);
  if (error) {
    throw error;
  }

  return { success: true } as const;
}