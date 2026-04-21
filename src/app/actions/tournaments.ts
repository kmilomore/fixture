"use server";

import { revalidatePath } from "next/cache";
import { requestServerApi } from "@/lib/serverApi";
import type { TournamentStatus } from "@/lib/tournamentLifecycle";

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const disciplineId = formData.get("disciplineId") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !disciplineId || !categoryId) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    const response = await requestServerApi<{ id: string }>("/api/tournaments", {
      method: "POST",
      body: JSON.stringify({ name, disciplineId, categoryId }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al crear el torneo" };
    }

    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al crear el torneo" };
  }
}

export async function deleteTournament(id: string) {
  try {
    const response = await requestServerApi<{ success: true }>(`/api/tournaments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al eliminar el torneo (podría tener equipos o partidos asociados)" };
    }

    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el torneo (podría tener equipos o partidos asociados)" };
  }
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
    try {
        const response = await requestServerApi<{ id: string }>(`/api/tournaments/${tournamentId}/teams`, {
            method: "POST",
            body: JSON.stringify({ teamId }),
        });

        if (!response.ok) {
            return { error: (response.body as { error?: string } | null)?.error ?? "Error al agregar equipo (quizás ya está en el torneo)" };
        }

        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true };
    } catch {
        return { error: "Error al agregar equipo (quizás ya está en el torneo)" };
    }
}

export async function removeTeamFromTournament(id: string, tournamentId: string) {
    try {
        const response = await requestServerApi<{ success: true }>(`/api/tournaments/${tournamentId}/teams/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            return { error: (response.body as { error?: string } | null)?.error ?? "Error al quitar equipo." };
        }

        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true };
    } catch {
        return { error: "Error al quitar equipo." };
    }
}

export async function updateTournamentStatus(tournamentId: string, status: TournamentStatus) {
  try {
    const response = await requestServerApi<{ id: string; status: TournamentStatus }>(`/api/tournaments/${tournamentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al actualizar el estado del torneo" };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado del torneo" };
  }
}
