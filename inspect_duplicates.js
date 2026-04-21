const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const establishments = await prisma.establishment.findMany();
  const summary = {};

  establishments.forEach(e => {
    const norm = e.name.trim().toUpperCase();
    if (!summary[norm]) {
      summary[norm] = {
        name: e.name,
        count: 0,
        minCreated: e.createdAt,
        maxCreated: e.createdAt,
        ids: []
      };
    }
    summary[norm].count++;
    if (e.createdAt < summary[norm].minCreated) summary[norm].minCreated = e.createdAt;
    if (e.createdAt > summary[norm].maxCreated) summary[norm].maxCreated = e.createdAt;
    summary[norm].ids.push(e.id);
  });

  const duplicates = Object.values(summary).filter(s => s.count > 1);
  const totalDuplicates = duplicates.reduce((acc, curr) => acc + curr.count, 0);
  
  console.log('Total establishments:', establishments.length);
  console.log('Total unique names with duplicates:', duplicates.length);
  console.log('Total duplicate records:', totalDuplicates);
  console.log('Sample duplicates:');
  console.log(JSON.stringify(duplicates.slice(0, 5), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
