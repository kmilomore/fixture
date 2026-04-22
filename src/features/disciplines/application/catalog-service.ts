import { getSupabase } from "@/infrastructure/supabase/client";
import { normalizeCatalogName } from "@/features/disciplines/domain/catalog-normalization";
import { ServiceError } from "@/shared/lib/service-error";

export type DisciplineListItem = { id: string; name: string; createdAt: string; updatedAt: string };
export type CategoryListItem = { id: string; name: string; gender: string; createdAt: string; updatedAt: string };

export async function listCatalogs() {
  const supabase = getSupabase();
  const [{ data: disciplines, error: disciplineError }, { data: categories, error: categoryError }] = await Promise.all([
    supabase.from("Discipline").select("id, name, createdAt, updatedAt").order("name", { ascending: true }),
    supabase.from("Category").select("id, name, gender, createdAt, updatedAt").order("createdAt", { ascending: true }),
  ]);

  if (disciplineError) {
    throw disciplineError;
  }

  if (categoryError) {
    throw categoryError;
  }

  return {
    disciplines: (disciplines ?? []) as DisciplineListItem[],
    categories: (categories ?? []) as CategoryListItem[],
  };
}

export async function getDisciplineDetail(id: string) {
  const supabase = getSupabase();
  const disciplineId = id.trim();

  if (!disciplineId) {
    throw new ServiceError(400, "El identificador de la disciplina es requerido");
  }

  const { data, error } = await supabase
    .from("Discipline")
    .select("id, name, createdAt, updatedAt")
    .eq("id", disciplineId)
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Disciplina no encontrada");
  }

  return data as DisciplineListItem;
}

export async function createDiscipline(input: { name: string }) {
  const supabase = getSupabase();
  const name = input.name.trim();

  if (!name) {
    throw new ServiceError(400, "El nombre es requerido");
  }

  const { data: existing } = await supabase.from("Discipline").select("name");
  if ((existing ?? []).some((item) => normalizeCatalogName(item.name) === normalizeCatalogName(name))) {
    throw new ServiceError(409, "La disciplina ya existe");
  }

  const { data, error } = await supabase
    .from("Discipline")
    .insert({ id: crypto.randomUUID(), name })
    .select("id, name, createdAt, updatedAt")
    .single();

  if (error || !data) {
    throw error;
  }

  return data as DisciplineListItem;
}

export async function updateDiscipline(input: { id: string; name?: string }) {
  const supabase = getSupabase();
  const disciplineId = input.id.trim();

  if (!disciplineId) {
    throw new ServiceError(400, "El identificador de la disciplina es requerido");
  }

  const updateData: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updateData.name = input.name.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return getDisciplineDetail(disciplineId);
  }

  const { data, error } = await supabase
    .from("Discipline")
    .update(updateData)
    .eq("id", disciplineId)
    .select("id, name, createdAt, updatedAt")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Disciplina no encontrada");
  }

  return data as DisciplineListItem;
}

export async function deleteDiscipline(id: string) {
  const supabase = getSupabase();
  const disciplineId = id.trim();

  if (!disciplineId) {
    throw new ServiceError(400, "El identificador de la disciplina es requerido");
  }

  const { error } = await supabase.from("Discipline").delete().eq("id", disciplineId);
  if (error) {
    throw error;
  }

  return { success: true } as const;
}

export async function getCategoryDetail(id: string) {
  const supabase = getSupabase();
  const categoryId = id.trim();

  if (!categoryId) {
    throw new ServiceError(400, "El identificador de la categoria es requerido");
  }

  const { data, error } = await supabase
    .from("Category")
    .select("id, name, gender, createdAt, updatedAt")
    .eq("id", categoryId)
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Categoria no encontrada");
  }

  return data as CategoryListItem;
}

export async function listCategories() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("Category")
    .select("id, name, gender, createdAt, updatedAt")
    .order("createdAt", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as CategoryListItem[];
}

export async function createCategory(input: { name: string; gender: string }) {
  const supabase = getSupabase();
  const name = input.name.trim();
  const gender = input.gender.trim();

  if (!name || !gender) {
    throw new ServiceError(400, "Nombre y genero son requeridos");
  }

  const { data: existing } = await supabase.from("Category").select("name, gender");
  if (
    (existing ?? []).some(
      (item) =>
        normalizeCatalogName(item.name) === normalizeCatalogName(name) &&
        normalizeCatalogName(item.gender) === normalizeCatalogName(gender)
    )
  ) {
    throw new ServiceError(409, "La categoria ya existe");
  }

  const { data, error } = await supabase
    .from("Category")
    .insert({ id: crypto.randomUUID(), name, gender })
    .select("id, name, gender, createdAt, updatedAt")
    .single();

  if (error || !data) {
    throw error;
  }

  return data as CategoryListItem;
}

export async function updateCategory(input: { id: string; name?: string; gender?: string }) {
  const supabase = getSupabase();
  const categoryId = input.id.trim();

  if (!categoryId) {
    throw new ServiceError(400, "El identificador de la categoria es requerido");
  }

  const updateData: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updateData.name = input.name.trim();
  }
  if (typeof input.gender === "string" && input.gender.trim()) {
    updateData.gender = input.gender.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return getCategoryDetail(categoryId);
  }

  const { data, error } = await supabase
    .from("Category")
    .update(updateData)
    .eq("id", categoryId)
    .select("id, name, gender, createdAt, updatedAt")
    .single();

  if (error || !data) {
    throw new ServiceError(404, "Categoria no encontrada");
  }

  return data as CategoryListItem;
}

export async function deleteCategory(id: string) {
  const supabase = getSupabase();
  const categoryId = id.trim();

  if (!categoryId) {
    throw new ServiceError(400, "El identificador de la categoria es requerido");
  }

  const { error } = await supabase.from("Category").delete().eq("id", categoryId);
  if (error) {
    throw error;
  }

  return { success: true } as const;
}