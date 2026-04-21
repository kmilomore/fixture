"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const disciplineId = formData.get("disciplineId") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !disciplineId || !categoryId) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    await prisma.tournament.create({
      data: { name, disciplineId, categoryId },
    });
    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Error al crear el torneo" };
  }
}

export async function deleteTournament(id: string) {
  try {
    await prisma.tournament.delete({ where: { id } });
    revalidatePath("/tournaments");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar el torneo (podría tener equipos o partidos asociados)" };
  }
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
    try {
        await prisma.tournamentTeam.create({
            data: { tournamentId, teamId }
        });
        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al agregar equipo (quizás ya está en el torneo)" };
    }
}

export async function removeTeamFromTournament(id: string, tournamentId: string) {
    try {
        await prisma.tournamentTeam.delete({
            where: { id }
        });
        revalidatePath(`/tournaments/${tournamentId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al quitar equipo." };
    }
}
