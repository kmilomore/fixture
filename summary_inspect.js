const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const establishments = await prisma.establishment.findMany({
    include: { teams: true }
  });

  const normalizedEsts = {};
  establishments.forEach(est => {
    const norm = est.name.trim().toLowerCase();
    if (!normalizedEsts[norm]) normalizedEsts[norm] = [];
    normalizedEsts[norm].push(est);
  });

  let totalDupEstablishments = 0;
  let totalDupTeams = 0;

  for (const name in normalizedEsts) {
    if (normalizedEsts[name].length > 1) {
      totalDupEstablishments += (normalizedEsts[name].length - 1);
      
      const teamNamesInGroup = {};
      normalizedEsts[name].forEach(est => {
        est.teams.forEach(team => {
          const tName = team.name.trim().toLowerCase();
          if (!teamNamesInGroup[tName]) teamNamesInGroup[tName] = [];
          teamNamesInGroup[tName].push(team.id);
        });
      });

      for (const tName in teamNamesInGroup) {
        if (teamNamesInGroup[tName].length > 1) {
          totalDupTeams += (teamNamesInGroup[tName].length - 1);
        }
      }
    }
  }

  console.log(`SUMMARY_START`);
  console.log(`Total Teams: ${await prisma.team.count()}`);
  console.log(`Duplicate Establishment Names Found: ${Object.keys(normalizedEsts).filter(k => normalizedEsts[k].length > 1).length}`);
  console.log(`Extra Establishment Records (to be merged): ${totalDupEstablishments}`);
  console.log(`Extra Team Records (to be merged): ${totalDupTeams}`);
  console.log(`SUMMARY_END`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
