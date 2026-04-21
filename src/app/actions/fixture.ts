"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateFixtureMatches, type FixtureFormat, type FixtureGenerationOptions } from "@/lib/fixtureEngine";

export async function setTournamentFormat(tournamentId: string, format: FixtureFormat) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { format, status: "DRAFT" },
    });
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
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: { include: { team: true } },
        matches: true,
      },
    });

    if (!tournament) return { error: "Torneo no encontrado" };
    if (!options.format) return { error: "Debes seleccionar el formato primero" };
    if (tournament.teams.length < 2) return { error: "Necesitas al menos 2 equipos para generar el fixture" };
    if (tournament.matches.length > 0) return { error: "Este torneo ya tiene partidos generados" };

    const teams = tournament.teams.map((tt) => ({
      id: tt.team.id,
      name: tt.team.name,
    }));

    const fixtureMatches = generateFixtureMatches(teams, options);

    // Insertar todos los partidos de una vez
    await prisma.match.createMany({
      data: fixtureMatches.map((m) => ({
        tournamentId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        round: m.round,
        groupName: m.groupName,
        matchLogicIdentifier: m.matchLogicIdentifier,
        date: m.date ?? null,
      })),
    });

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "PLAYING", format: options.format },
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, count: fixtureMatches.length };
  } catch (e) {
    console.error(e);
    return { error: "Error al generar el fixture" };
  }
}

export async function resetFixture(tournamentId: string) {
  try {
    await prisma.match.deleteMany({ where: { tournamentId } });
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "DRAFT", format: null },
    });
    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch {
    return { error: "Error al reiniciar el fixture" };
  }
}

export async function updateMatchResult(matchId: string, homeScore: number, awayScore: number, location?: string, date?: string) {
  try {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        isFinished: true,
        location: location || null,
        date: date ? new Date(date) : null,
      },
    });
    revalidatePath("/tournaments");
    return { success: true };
  } catch {
    return { error: "Error al actualizar resultado" };
  }
}

// Carga masiva de establecimientos desde CSV
export async function bulkCreateEstablishments(rows: Array<{ name: string; comuna?: string | null }>) {
  try {
    const {
      dedupeEstablishmentRows,
      ensureTeamsMatchEstablishments,
      getExistingEstablishmentNameSet,
      normalizeComuna,
      normalizeEstablishmentName,
    } = await import("@/lib/establishments");
    const validRows = dedupeEstablishmentRows(
      rows
        .filter((row) => row.name && row.name.trim() !== "")
        .map((row) => ({ name: row.name.trim(), comuna: normalizeComuna(row.comuna) }))
    );
    const existingNames = await getExistingEstablishmentNameSet();
    let count = 0;

    for (const row of validRows) {
      if (existingNames.has(normalizeEstablishmentName(row.name))) {
        continue;
      }

      try {
        await prisma.establishment.create({
          data: {
            name: row.name.trim(),
            comuna: normalizeComuna(row.comuna),
          },
        });
        existingNames.add(normalizeEstablishmentName(row.name));
        count++;
      } catch {
        // Ignorar registros inválidos individuales y continuar con el resto.
      }
    }

    await ensureTeamsMatchEstablishments();

    revalidatePath("/establishments");
    revalidatePath("/teams");
    revalidatePath("/");
    return { success: true, count };
  } catch (e) {
    console.error(e);
    return { error: "Error al importar establecimientos" };
  }
}
