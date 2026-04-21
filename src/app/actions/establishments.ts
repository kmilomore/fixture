"use server";

import { revalidatePath } from "next/cache";
import { requestServerApi } from "@/lib/serverApi";

export async function createEstablishment(formData: FormData) {
  const name = formData.get("name") as string;
  const comuna = formData.get("comuna") as string | null;
  const logoUrl = formData.get("logoUrl") as string | null;

  if (!name || name.trim() === "") {
    return { error: "El nombre es requerido" };
  }

  try {
    const response = await requestServerApi<{ id: string }>("/api/establishments", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        comuna,
        logoUrl,
      }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al crear el establecimiento" };
    }

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al crear el establecimiento" };
  }
}

export async function deleteEstablishment(id: string) {
  try {
    const response = await requestServerApi<{ success: true }>(`/api/establishments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al eliminar (puede tener equipos asociados)" };
    }

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al eliminar (puede tener equipos asociados)" };
  }
}
