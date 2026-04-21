"use server";

import { revalidatePath } from "next/cache";
import { requestServerApi } from "@/lib/serverApi";

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const establishmentId = formData.get("establishmentId") as string;

  if (!name || !establishmentId) {
    return { error: "Nombre y establecimiento son requeridos." };
  }

  try {
    const response = await requestServerApi<{ id: string }>("/api/teams", {
      method: "POST",
      body: JSON.stringify({ name, establishmentId }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al crear el equipo." };
    }

    revalidatePath("/teams");
    revalidatePath("/establishments");
    return { success: true };
  } catch {
    return { error: "Error al crear el equipo." };
  }
}

export async function deleteTeam(id: string) {
  try {
    const response = await requestServerApi<{ success: true }>(`/api/teams/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al eliminar el equipo." };
    }

    revalidatePath("/teams");
    revalidatePath("/establishments");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el equipo." };
  }
}
