import { getSupabase } from "@/infrastructure/supabase/client";

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