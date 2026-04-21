"use server";

import { revalidatePath } from "next/cache";
import { type FixtureFormat, type FixtureGenerationOptions } from "@/lib/fixtureEngine";
import type { FixtureSchedulingRules } from "@/lib/fixtureEngine";
import type { MatchIncidentType, MatchStatus } from "@/lib/matchLifecycle";
import {
  generateFixture as generateFixtureService,
  resetFixture as resetFixtureService,
  setTournamentFormat as setTournamentFormatService,
  updateMatchResult as updateMatchResultService,
} from "@/features/fixture/application/fixture-service";
import { asServiceError } from "@/shared/lib/service-error";

export async function setTournamentFormat(
  tournamentId: string,
  format: FixtureFormat,
  schedulingRules?: FixtureSchedulingRules
) {
  try {
    await setTournamentFormatService({ tournamentId, format, schedulingRules });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al guardar el formato").message };
  }
}

export async function generateFixture(
  tournamentId: string,
  options: FixtureGenerationOptions
) {
  try {
    const response = await generateFixtureService({ tournamentId, options });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, count: response.count };
  } catch (e) {
    console.error(e);
    return { error: asServiceError(e, "Error al generar el fixture").message };
  }
}

export async function resetFixture(tournamentId: string) {
  try {
    await resetFixtureService(tournamentId);

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al reiniciar el fixture").message };
  }
}

export async function updateMatchResult(
  tournamentId: string,
  matchId: string,
  payload: {
    homeScore?: number;
    awayScore?: number;
    location?: string;
    date?: string;
    status: MatchStatus;
    incidentType?: MatchIncidentType | null;
    incidentNotes?: string | null;
  }
) {
  try {
    await updateMatchResultService({
      matchId,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      status: payload.status,
      isFinished: payload.status === "FINISHED" || payload.status === "WALKOVER",
      location: payload.location || null,
      date: payload.date ? new Date(payload.date) : null,
      incidentType: payload.incidentType ?? null,
      incidentNotes: payload.incidentNotes ?? null,
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error) {
    return { error: asServiceError(error, "Error al actualizar el partido").message };
  }
}
