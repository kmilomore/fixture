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

export async function bulkCreateEstablishments(rows: Array<{ name: string; comuna?: string | null }>) {
  try {
    const normalizeComuna = (value?: string | null) => {
      const normalized = typeof value === "string" ? value.trim() : "";
      return normalized ? normalized : null;
    };
    const normalizeEstablishmentName = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const validRows = Array.from(
      new Map(
        rows
          .filter((row) => row.name && row.name.trim() !== "")
          .map((row) => {
            const name = row.name.trim();
            return [normalizeEstablishmentName(name), { name, comuna: normalizeComuna(row.comuna) }] as const;
          })
      ).values()
    );

    const existingResponse = await requestServerApi<Array<{ name: string }>>("/api/establishments", {
      method: "GET",
    });

    if (!existingResponse.ok || !existingResponse.body) {
      return { error: "Error al consultar establecimientos existentes" };
    }

    const existingEstablishments = Array.isArray(existingResponse.body) ? existingResponse.body : [];
    const existingNames = new Set(existingEstablishments.map((item: { name: string }) => normalizeEstablishmentName(item.name)));
    let count = 0;

    for (const row of validRows) {
      if (existingNames.has(normalizeEstablishmentName(row.name))) {
        continue;
      }

      try {
        const createResponse = await requestServerApi<{ id: string } | { error?: string }>("/api/establishments", {
          method: "POST",
          body: JSON.stringify({
            name: row.name.trim(),
            comuna: normalizeComuna(row.comuna),
          }),
        });

        if (!createResponse.ok) {
          continue;
        }

        existingNames.add(normalizeEstablishmentName(row.name));
        count++;
      } catch {
        // Ignorar registros invalidos individuales y continuar con el resto.
      }
    }

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true, count };
  } catch (error) {
    console.error(error);
    return { error: "Error al importar establecimientos" };
  }
}
