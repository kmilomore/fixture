import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function chooseCanonicalEstablishment(establishments) {
  return [...establishments].sort((left, right) => {
    const comunaScore = Number(Boolean(right.comuna)) - Number(Boolean(left.comuna));
    if (comunaScore !== 0) {
      return comunaScore;
    }

    const createdAtScore = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    if (createdAtScore !== 0) {
      return createdAtScore;
    }

    return left.id.localeCompare(right.id);
  })[0];
}

async function mergeTournamentTeams(duplicateTeamId, canonicalTeamId) {
  const duplicateTournamentTeams = await prisma.tournamentTeam.findMany({
    where: { teamId: duplicateTeamId },
  });

  for (const tournamentTeam of duplicateTournamentTeams) {
    const existing = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId: tournamentTeam.tournamentId,
        teamId: canonicalTeamId,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.tournamentTeam.delete({ where: { id: tournamentTeam.id } });
      continue;
    }

    await prisma.tournamentTeam.update({
      where: { id: tournamentTeam.id },
      data: { teamId: canonicalTeamId },
    });
  }
}

async function mergeTeamIntoCanonical(duplicateTeamId, canonicalTeamId) {
  if (duplicateTeamId === canonicalTeamId) {
    return;
  }

  await mergeTournamentTeams(duplicateTeamId, canonicalTeamId);
  await prisma.match.updateMany({ where: { homeTeamId: duplicateTeamId }, data: { homeTeamId: canonicalTeamId } });
  await prisma.match.updateMany({ where: { awayTeamId: duplicateTeamId }, data: { awayTeamId: canonicalTeamId } });
  await prisma.team.delete({ where: { id: duplicateTeamId } });
}

async function main() {
  const establishments = await prisma.establishment.findMany({
    orderBy: { createdAt: "asc" },
    include: { teams: { orderBy: { createdAt: "asc" } } },
  });

  const groups = new Map();

  for (const establishment of establishments) {
    const normalized = normalizeName(establishment.name);
    const group = groups.get(normalized) ?? [];
    group.push(establishment);
    groups.set(normalized, group);
  }

  let mergedEstablishments = 0;
  let mergedTeams = 0;

  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }

    const canonical = chooseCanonicalEstablishment(group);
    const canonicalTeams = new Map(canonical.teams.map((team) => [normalizeName(team.name), team]));

    for (const duplicate of group) {
      if (duplicate.id === canonical.id) {
        continue;
      }

      for (const team of duplicate.teams) {
        const normalizedTeamName = normalizeName(team.name);
        const canonicalTeam = canonicalTeams.get(normalizedTeamName);

        if (canonicalTeam) {
          await mergeTeamIntoCanonical(team.id, canonicalTeam.id);
          mergedTeams += 1;
          continue;
        }

        const movedTeam = await prisma.team.update({
          where: { id: team.id },
          data: { establishmentId: canonical.id },
        });

        canonicalTeams.set(normalizedTeamName, movedTeam);
      }

      await prisma.establishment.delete({ where: { id: duplicate.id } });
      mergedEstablishments += 1;
    }
  }

  console.log(JSON.stringify({ mergedEstablishments, mergedTeams }, null, 2));
}

await main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });