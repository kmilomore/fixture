const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const teamsWithMatches = await prisma.team.findMany({
    where: {
      OR: [
        { homeMatches: { some: {} } },
        { awayMatches: { some: {} } },
        { tournamentTeams: { some: {} } }
      ]
    },
    select: { id: true, name: true }
  });
  console.log(`Teams with relationships: ${teamsWithMatches.length}`);
}

main().finally(() => prisma.$disconnect());
