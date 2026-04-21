"use server";

import prisma from "@/lib/prisma";
import {
  ensureTeamsMatchEstablishments,
  getExistingEstablishmentNameSet,
  normalizeComuna,
  normalizeEstablishmentName,
} from "@/lib/establishments";
import { revalidatePath } from "next/cache";

export async function createEstablishment(formData: FormData) {
  const name = formData.get("name") as string;
  const comuna = formData.get("comuna") as string | null;
  const logoUrl = formData.get("logoUrl") as string | null;

  if (!name || name.trim() === "") {
    return { error: "El nombre es requerido" };
  }

  try {
    const normalizedName = normalizeEstablishmentName(name);
    const existingNames = await getExistingEstablishmentNameSet();

    if (existingNames.has(normalizedName)) {
      return { error: "El establecimiento ya existe" };
    }

    await prisma.establishment.create({
      data: {
        name: name.trim(),
        comuna: normalizeComuna(comuna),
        logoUrl: logoUrl || null,
      },
    });

    await ensureTeamsMatchEstablishments();

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/"); // revalidate dashboard
    return { success: true };
  } catch {
    return { error: "Error al crear el establecimiento" };
  }
}

export async function deleteEstablishment(id: string) {
  try {
    await prisma.establishment.delete({
      where: { id },
    });
    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al eliminar (puede tener equipos asociados)" };
  }
}
