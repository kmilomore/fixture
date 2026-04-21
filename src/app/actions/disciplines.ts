"use server";

import { normalizeCatalogName } from "@/lib/catalogs";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDiscipline(formData: FormData) {
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "El nombre de la disciplina es requerido" };
  }

  try {
    const normalizedName = normalizeCatalogName(name);
    const existing = await prisma.discipline.findMany({
      select: { name: true },
    });

    if (existing.some((discipline) => normalizeCatalogName(discipline.name) === normalizedName)) {
      return { error: "La disciplina ya existe" };
    }

    await prisma.discipline.create({
      data: { name: name.trim() },
    });
    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al crear disciplina" };
  }
}

export async function deleteDiscipline(id: string) {
  try {
    await prisma.discipline.delete({ where: { id } });
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
    const normalizedName = normalizeCatalogName(name);
    const normalizedGender = normalizeCatalogName(gender);
    const existing = await prisma.category.findMany({
      select: { name: true, gender: true },
    });

    if (
      existing.some(
        (category) =>
          normalizeCatalogName(category.name) === normalizedName &&
          normalizeCatalogName(category.gender) === normalizedGender
      )
    ) {
      return { error: "La categoría ya existe" };
    }

    await prisma.category.create({
      data: { name: name.trim(), gender: gender.trim() },
    });
    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al crear la categoría" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la categoría" };
  }
}
