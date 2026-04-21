"use server";

import { revalidatePath } from "next/cache";
import { type FixtureFormat, type FixtureGenerationOptions } from "@/lib/fixtureEngine";
import { requestServerApi } from "@/lib/serverApi";
import type { FixtureSchedulingRules } from "@/lib/fixtureEngine";
import type { MatchIncidentType, MatchStatus } from "@/lib/matchLifecycle";

export async function setTournamentFormat(
  tournamentId: string,
  format: FixtureFormat,
  schedulingRules?: FixtureSchedulingRules
) {
  try {
    const response = await requestServerApi<{ id: string }>(`/api/tournaments/${tournamentId}/fixture/format`, {
      method: "PUT",
      body: JSON.stringify({ format, schedulingRules }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al guardar el formato" };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch {
    return { error: "Error al guardar el formato" };
  }
}

export async function generateFixture(
  tournamentId: string,
  options: FixtureGenerationOptions
) {
  try {
    const response = await requestServerApi<{ success: true; count: number } | { error?: string }>(`/api/tournaments/${tournamentId}/fixture/generate`, {
      method: "POST",
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al generar el fixture" };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, count: (response.body as { count: number }).count };
  } catch (e) {
    console.error(e);
    return { error: "Error al generar el fixture" };
  }
}

export async function resetFixture(tournamentId: string) {
  try {
    const response = await requestServerApi<{ success: true }>(`/api/tournaments/${tournamentId}/fixture/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al reiniciar el fixture" };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch {
    return { error: "Error al reiniciar el fixture" };
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
    const response = await requestServerApi<{ id: string }>(`/api/matches/${matchId}`, {
      method: "PATCH",
      body: JSON.stringify({
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
        status: payload.status,
        isFinished: payload.status === "FINISHED" || payload.status === "WALKOVER",
        location: payload.location || null,
        date: payload.date ? new Date(payload.date) : null,
        incidentType: payload.incidentType ?? null,
        incidentNotes: payload.incidentNotes ?? null,
      }),
    });

    if (!response.ok) {
      return { error: (response.body as { error?: string } | null)?.error ?? "Error al actualizar el partido" };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el partido" };
  }
}

// Carga masiva de establecimientos desde CSV
export async function bulkCreateEstablishments(rows: Array<{ name: string; comuna?: string | null }>) {
  try {
    const normalizeComuna = (value?: string | null) => {
      const normalized = typeof value === "string" ? value.trim() : "";
      return normalized ? normalized : null;
    };
    const normalizeEstablishmentName = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const validRows = Array.from(
      new Map(
        rows
          .filter((row) => row.name && row.name.trim() !== "")
          .map((row) => {
            const name = row.name.trim();
            return [normalizeEstablishmentName(name), { name, comuna: normalizeComuna(row.comuna) }] as const;
          })
      ).values()
    );

    const existingResponse = await requestServerApi<Array<{ name: string }>>("/api/establishments", {
      method: "GET",
    });

    if (!existingResponse.ok || !existingResponse.body) {
      return { error: "Error al consultar establecimientos existentes" };
    }

    const existingEstablishments = Array.isArray(existingResponse.body) ? existingResponse.body : [];
    const existingNames = new Set(existingEstablishments.map((item: { name: string }) => normalizeEstablishmentName(item.name)));
    let count = 0;

    for (const row of validRows) {
      if (existingNames.has(normalizeEstablishmentName(row.name))) {
        continue;
      }

      try {
        const createResponse = await requestServerApi<{ id: string } | { error?: string }>("/api/establishments", {
          method: "POST",
          body: JSON.stringify({
            name: row.name.trim(),
            comuna: normalizeComuna(row.comuna),
          }),
        });

        if (!createResponse.ok) {
          continue;
        }

        existingNames.add(normalizeEstablishmentName(row.name));
        count++;
      } catch {
        // Ignorar registros inválidos individuales y continuar con el resto.
      }
    }

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true, count };
  } catch (e) {
    console.error(e);
    return { error: "Error al importar establecimientos" };
  }
}
