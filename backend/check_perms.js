const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findUnique({
    where: { email: 'crm@admin.com' },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(account.role.permissions.map(p => p.permission.code), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
