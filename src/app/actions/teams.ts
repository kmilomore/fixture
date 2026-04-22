"use server";

import { revalidatePath } from "next/cache";
import {
  createTeam as createTeamService,
  deleteTeam as deleteTeamService,
} from "@/features/teams/application/team-service";
import { asServiceError } from "@/shared/lib/service-error";

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const establishmentId = formData.get("establishmentId") as string;

  if (!name || !establishmentId) {
    return { error: "Nombre y establecimiento son requeridos." };
  }

  try {
    await createTeamService({ name, establishmentId });

    revalidatePath("/teams");
    revalidatePath("/establishments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al crear el equipo.").message };
  }
}

export async function deleteTeam(id: string) {
  try {
    await deleteTeamService(id);

    revalidatePath("/teams");
    revalidatePath("/establishments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al eliminar el equipo.").message };
  }
}
