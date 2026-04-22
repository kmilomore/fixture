import { getSupabase } from "@/infrastructure/supabase/client";
import { normalizeComuna, normalizeEstablishmentName } from "@/features/establishments/domain/establishment-normalization";
import { ServiceError } from "@/shared/lib/service-error";

export type EstablishmentListItem = {
  id: string;
  name: string;
  comuna: string | null;
  teamsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EstablishmentDetail = EstablishmentListItem & {
  logoUrl: string | null;
};

type EstablishmentRowWithTeams = {
  id: string;
  name: string;
  comuna: string | null;
  createdAt: string;
  updatedAt: string;
  Team?: Array<unknown> | null;
};

function mapEstablishmentListItem(row: EstablishmentRowWithTeams): EstablishmentListItem {
  return {
    id: row.id,
    name: row.name,
    comuna: row.comuna,
    teamsCount: Array.isArray(row.Team) ? row.Team.length : 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function createEstablishmentRecord(input: {
  name: string;
  comuna?: string | null;
  logoUrl?: string | null;
}) {
  const supabase = getSupabase();
  const name = input.name.trim();
  const comuna = normalizeComuna(input.comuna);
  const logoUrl = typeof input.logoUrl === "string" && input.logoUrl.trim() ? input.logoUrl.trim() : null;

  const { data, error } = await supabase
    .from("Establishment")
    .insert({ id: crypto.randomUUID(), name, comuna, logoUrl })
    .select("id, name, comuna, logoUrl, createdAt, updatedAt")
    .single();

  if (error || !data) {
    throw error;
  }

  await supabase.from("Team").insert({ id: crypto.randomUUID(), name, establishmentId: data.id });

  return {
    id: data.id,
    name: data.name,
    comuna: data.comuna,
    logoUrl: data.logoUrl,
    teamsCount: 1,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } satisfies EstablishmentDetail;
}

export async function listEstablishments(input?: { q?: string; comuna?: string }) {
  const supabase = getSupabase();
  const q = input?.q?.trim() ?? "";
  const comuna = input?.comuna?.trim() ?? "";

  let query = supabase
    .from("Establishment")
    .select("id, name, comuna, createdAt, updatedAt, Team(id)")
    .order("name", { ascending: true });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (comuna) {
    query = query.ilike("comuna", comuna);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapEstablishmentListItem(row as EstablishmentRowWithTeams));
}

export async function getEstablishmentDetail(id: string) {
  const supabase = getSupabase();
  const establishmentId = id.trim();

  if (!establishmentId) {
    throw new ServiceError(400, "El identificador del establecimiento es requerido");
  }

  const { data, error } = await supabase
    .from("Establishment")
    .select("id, name, comuna, logoUrl, createdAt, updatedAt, Team(id)")
    .eq("id", establishmentId)
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Establecimiento no encontrado");
  }

  return {
    ...mapEstablishmentListItem(data as EstablishmentRowWithTeams),
    logoUrl: data.logoUrl,
  } satisfies EstablishmentDetail;
}

export async function createEstablishment(input: {
  name: string;
  comuna?: string | null;
  logoUrl?: string | null;
}) {
  const name = input.name.trim();

  if (!name) {
    throw new ServiceError(400, "El nombre es requerido");
  }

  const existingEstablishments = await listEstablishments();
  if (existingEstablishments.some((row) => normalizeEstablishmentName(row.name) === normalizeEstablishmentName(name))) {
    throw new ServiceError(409, "El establecimiento ya existe");
  }

  return createEstablishmentRecord(input);
}

export async function updateEstablishment(input: {
  id: string;
  name?: string;
  comuna?: string | null;
  logoUrl?: string | null;
}) {
  const supabase = getSupabase();
  const id = input.id.trim();

  if (!id) {
    throw new ServiceError(400, "El identificador del establecimiento es requerido");
  }

  const updateData: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updateData.name = input.name.trim();
  }
  if (input.comuna !== undefined) {
    updateData.comuna = normalizeComuna(input.comuna);
  }
  if (input.logoUrl !== undefined) {
    updateData.logoUrl = typeof input.logoUrl === "string" ? input.logoUrl.trim() || null : null;
  }

  if (Object.keys(updateData).length === 0) {
    return getEstablishmentDetail(id);
  }

  const { data, error } = await supabase
    .from("Establishment")
    .update(updateData)
    .eq("id", id)
    .select("id, name, comuna, logoUrl, createdAt, updatedAt, Team(id)")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Establecimiento no encontrado");
  }

  return {
    ...mapEstablishmentListItem(data as EstablishmentRowWithTeams),
    logoUrl: data.logoUrl,
  } satisfies EstablishmentDetail;
}

export async function deleteEstablishment(id: string) {
  const supabase = getSupabase();
  const establishmentId = id.trim();

  if (!establishmentId) {
    throw new ServiceError(400, "El identificador del establecimiento es requerido");
  }

  const { error } = await supabase.from("Establishment").delete().eq("id", establishmentId);
  if (error) {
    throw error;
  }

  return { success: true } as const;
}

export async function bulkCreateEstablishments(rows: Array<{ name: string; comuna?: string | null }>) {
  const validRows = Array.from(
    new Map(
      rows
        .filter((row) => row.name && row.name.trim() !== "")
        .map((row) => {
          const name = row.name.trim();
          return [
            normalizeEstablishmentName(name),
            { name, comuna: normalizeComuna(row.comuna) },
          ] as const;
        })
    ).values()
  );

  const existingEstablishments = await listEstablishments();
  const existingNames = new Set(existingEstablishments.map((item) => normalizeEstablishmentName(item.name)));
  let count = 0;

  for (const row of validRows) {
    if (existingNames.has(normalizeEstablishmentName(row.name))) {
      continue;
    }

    try {
      await createEstablishmentRecord({ name: row.name, comuna: row.comuna });
      existingNames.add(normalizeEstablishmentName(row.name));
      count += 1;
    } catch {
      // Ignorar registros invalidos individuales y continuar con el resto.
    }
  }

  return { success: true, count } as const;
}