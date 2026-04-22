"use server";

import { revalidatePath } from "next/cache";
import {
  bulkCreateEstablishments as bulkCreateEstablishmentsService,
  createEstablishment as createEstablishmentService,
  deleteEstablishment as deleteEstablishmentService,
} from "@/features/establishments/application/establishment-service";
import { asServiceError } from "@/shared/lib/service-error";

export async function createEstablishment(formData: FormData) {
  const name = formData.get("name") as string;
  const comuna = formData.get("comuna") as string | null;
  const logoUrl = formData.get("logoUrl") as string | null;

  if (!name || name.trim() === "") {
    return { error: "El nombre es requerido" };
  }

  try {
    await createEstablishmentService({
      name: name.trim(),
      comuna,
      logoUrl,
    });

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al crear el establecimiento").message };
  }
}

export async function deleteEstablishment(id: string) {
  try {
    await deleteEstablishmentService(id);

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al eliminar (puede tener equipos asociados)").message };
  }
}

export async function bulkCreateEstablishments(rows: Array<{ name: string; comuna?: string | null }>) {
  try {
    const response = await bulkCreateEstablishmentsService(rows);

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return response;
  } catch (error) {
    return { error: asServiceError(error, "Error al importar establecimientos").message };
  }
}
