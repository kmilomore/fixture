"use server";

import { normalizeCatalogName } from "@/lib/catalogs";
import { revalidatePath } from "next/cache";
import { requestServerApi } from "@/lib/serverApi";

export async function createDiscipline(formData: FormData) {
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "El nombre de la disciplina es requerido" };
  }

  try {
    const response = await requestServerApi<{ id: string }>("/api/disciplines", {
      method: "POST",
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al crear disciplina" };
    }

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al crear disciplina" };
  }
}

export async function deleteDiscipline(id: string) {
  try {
    const response = await requestServerApi<{ success: true }>(`/api/disciplines/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al eliminar" };
    }

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al eliminar" };
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as string;

  if (!name || !gender) {
    return { error: "El nombre y el género son requeridos" };
  }

  try {
    const response = await requestServerApi<{ id: string }>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), gender: gender.trim() }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al crear la categoría" };
    }

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al crear la categoría" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const response = await requestServerApi<{ success: true }>(`/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al eliminar la categoría" };
    }

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la categoría" };
  }
}
