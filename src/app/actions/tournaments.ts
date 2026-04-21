"use server";

import { revalidatePath } from "next/cache";
import type { TournamentStatus } from "@/lib/tournamentLifecycle";
import {
  addTeamToTournament as addTeamToTournamentService,
  createTournament as createTournamentService,
  deleteTournament as deleteTournamentService,
  removeTeamFromTournament as removeTeamFromTournamentService,
  updateTournament,
} from "@/features/tournaments/application/tournament-service";
import { asServiceError } from "@/shared/lib/service-error";

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const disciplineId = formData.get("disciplineId") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !disciplineId || !categoryId) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    await createTournamentService({ name, disciplineId, categoryId });

    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al crear el torneo").message };
  }
}

export async function deleteTournament(id: string) {
  try {
    await deleteTournamentService(id);

    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al eliminar el torneo (podria tener equipos o partidos asociados)").message };
  }
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
    try {
        await addTeamToTournamentService({ tournamentId, teamId });

        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true };
    } catch (error) {
        return { error: asServiceError(error, "Error al agregar equipo (quizas ya esta en el torneo)").message };
    }
}

export async function removeTeamFromTournament(id: string, tournamentId: string) {
    try {
        await removeTeamFromTournamentService({ tournamentId, teamEntryId: id });

        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true };
    } catch (error) {
        return { error: asServiceError(error, "Error al quitar equipo.").message };
    }
}

export async function updateTournamentStatus(tournamentId: string, status: TournamentStatus) {
  try {
    await updateTournament({ id: tournamentId, status });

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al actualizar el estado del torneo").message };
  }
}
