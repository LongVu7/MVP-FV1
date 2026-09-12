const prisma = require('../../config/db');

async function getManagedGroupMemberIds(accountId) {
  const ug = await prisma.userGroup.findFirst({
    where: {
      OR: [
        { groupLeader: accountId },
        { accounts: { some: { id: accountId } } }
      ]
    },
    include: { accounts: true }
  });

  if (ug) {
    const ids = ug.accounts.map(a => a.id);
    if (!ids.includes(ug.groupLeader)) {
       ids.push(ug.groupLeader);
    }
    return ids;
  }
  return [];
}

async function buildReportScope(user) {
  if (user.permissions.has('report.read_all')) {
    return { mode: 'all', assignedToIds: null };
  }

  const ids = [user.accountId];

  if (user.permissions.has('report.read_group')) {
    const memberIds = await getManagedGroupMemberIds(user.accountId);
    ids.push(...memberIds);
  }

  return { mode: 'assigned', assignedToIds: [...new Set(ids)] };
}

module.exports = {
  buildReportScope
};
