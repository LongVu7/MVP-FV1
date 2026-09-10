const { Prisma } = require('@prisma/client');
const prisma = require('../../config/db');

async function buildReportScope(user) {
  const account = await prisma.account.findUnique({
    where: { id: user.accountId },
    include: { role: { include: { permissions: { include: { permission: true } } } } }
  });

  if (!account) return Prisma.sql`AND 1 = 0`; // Deny all

  const hasPermission = (code) =>
    account.role.permissions.some(rp => rp.permission.code === code);

  // Allow seeing all if report.read_all
  if (hasPermission('report.read_all')) {
    return Prisma.empty; // No restrictions
  }

  // Allow seeing team if report.read_group
  if (hasPermission('report.read_group')) {
    const ug = await prisma.userGroup.findFirst({
      where: {
        OR: [
          { groupLeader: user.accountId },
          { accounts: { some: { id: user.accountId } } }
        ]
      },
      include: { accounts: true }
    });

    if (ug) {
      const accountIds = ug.accounts.map(a => a.id);
      if (!accountIds.includes(ug.groupLeader)) {
         accountIds.push(ug.groupLeader);
      }
      return Prisma.sql`AND inquiry.assigned_to_id IN (${Prisma.join(accountIds)})`;
    }
  }

  // Default: only see own
  return Prisma.sql`AND inquiry.assigned_to_id = ${user.accountId}`;
}

module.exports = {
  buildReportScope
};
