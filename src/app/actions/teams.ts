"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const establishmentId = formData.get("establishmentId") as string;

  if (!name || !establishmentId) {
    return { error: "Nombre y establecimiento son requeridos." };
  }

  try {
    await prisma.team.create({
      data: { name, establishmentId },
    });
    revalidatePath("/teams");
    revalidatePath("/establishments"); // updates count
    return { success: true };
  } catch (error) {
    return { error: "Error al crear el equipo." };
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.team.delete({ where: { id } });
    revalidatePath("/teams");
    revalidatePath("/establishments");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar el equipo." };
  }
}
