require('dotenv').config();
const prisma = require('./config/db');
async function main() {
  const nbStatus = await prisma.statusData.findFirst({
    where: { name: { contains: 'payment_completed_n' } }
  });
  console.log('NB STATUS:', nbStatus);
}
main().finally(() => prisma.$disconnect());
