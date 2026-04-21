const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const totalTeams = await prisma.team.count();
  const totalEstablishments = await prisma.establishment.count();

  // 1. Get all establishments and normalize names
  const establishments = await prisma.establishment.findMany({
    include: { teams: true }
  });

  const normalizedEsts = {};
  establishments.forEach(est => {
    const norm = est.name.trim().toLowerCase();
    if (!normalizedEsts[norm]) normalizedEsts[norm] = [];
    normalizedEsts[norm].push(est);
  });

  console.log(`Total Teams: ${totalTeams}`);
  console.log(`Total Establishments: ${totalEstablishments}`);
  console.log(`\n--- Duplicate Establishments (by name) ---`);

  let duplicateEstGroups = 0;
  for (const name in normalizedEsts) {
    if (normalizedEsts[name].length > 1) {
      duplicateEstGroups++;
      console.log(`Establishment Name: "${name}" (${normalizedEsts[name].length} occurrences)`);
      
      const teamNamesInGroup = {};
      normalizedEsts[name].forEach(est => {
        est.teams.forEach(team => {
          const tName = team.name.trim().toLowerCase();
          if (!teamNamesInGroup[tName]) teamNamesInGroup[tName] = [];
          teamNamesInGroup[tName].push({ teamId: team.id, estId: est.id });
        });
      });

      console.log(`  Potential Duplicate Teams in this establishment group:`);
      let dupTeamsInEst = 0;
      for (const tName in teamNamesInGroup) {
        if (teamNamesInGroup[tName].length > 1) {
          dupTeamsInEst++;
          console.log(`    - Team Name: "${tName}" (Found in ${teamNamesInGroup[tName].length} establishments)`);
        }
      }
      if (dupTeamsInEst === 0) console.log(`    (No duplicate team names found across these duplicate establishments)`);
    }
  }

  if (duplicateEstGroups === 0) {
    console.log("No duplicate establishments found by name.");
  }

  // Safety Check: Check if any of these duplicate teams have related records that might conflict
  // For the purpose of the report, we'll just check if they have matches or are in tournaments.
  // If we were to merge, we'd need to reassign Match and TournamentTeam records.

  console.log(`\n--- Merging Safety Assessment ---`);
  console.log(`Reassigning teams from duplicate establishments to a canonical establishment is safe if:`);
  console.log(`1. We update the 'establishmentId' in the 'Team' table.`);
  console.log(`2. If we merge 'duplicate teams' (same name in different duplicate establishments), we must also update 'Match' and 'TournamentTeam' references.`);
  console.log(`3. We must check for UNIQUE constraint violations in TournamentTeam (@@unique([tournamentId, teamId])).`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
