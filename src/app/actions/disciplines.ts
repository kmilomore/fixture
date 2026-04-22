"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory as createCategoryService,
  createDiscipline as createDisciplineService,
  deleteCategory as deleteCategoryService,
  deleteDiscipline as deleteDisciplineService,
} from "@/features/disciplines/application/catalog-service";
import { asServiceError } from "@/shared/lib/service-error";

export async function createDiscipline(formData: FormData) {
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "El nombre de la disciplina es requerido" };
  }

  try {
    await createDisciplineService({ name: name.trim() });

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al crear disciplina").message };
  }
}

export async function deleteDiscipline(id: string) {
  try {
    await deleteDisciplineService(id);

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al eliminar").message };
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as string;

  if (!name || !gender) {
    return { error: "El nombre y el género son requeridos" };
  }

  try {
    await createCategoryService({ name: name.trim(), gender: gender.trim() });

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al crear la categoría").message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await deleteCategoryService(id);

    revalidatePath("/disciplines");
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al eliminar la categoría").message };
  }
}
