require('dotenv').config();
const prisma = require('./config/db');

async function checkProdSourceData() {
  console.log("Checking root sources (level: 'source', isActive: true)...");
  const roots = await prisma.sourceData.findMany({
    where: { level: 'source', isActive: true },
    select: { id: true, name: true }
  });
  console.log("Roots found:", roots.length, roots);

  console.log("Checking all sourceData count...");
  const count = await prisma.sourceData.count();
  console.log("Total sourceData records:", count);

  console.log("Checking if any have level = 'source' regardless of isActive...");
  const allRoots = await prisma.sourceData.findMany({
    where: { level: 'source' },
    select: { id: true, name: true, isActive: true }
  });
  console.log("All Roots found:", allRoots.length, allRoots);
}

checkProdSourceData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
