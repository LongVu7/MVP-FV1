const prisma = require('../../config/db');

//Helper to get group member's account IDs for a manager
const getGroupMemberIds = async (accountId) => {
  const groups = await prisma.userGroup.findMany({
    where: { groupLeaderId: accountId },
    select: {
      accounts: { select: { id: true } }
    }
  });

  const memberIds = groups.flatMap(g => g.accounts.map(a => a.id));
  return [...new Set(memberIds)];
};

//Build Prisma WHERE scope for inquiry queries
const buildInquiryScope = async (user) => {
  if (user.roleName === 'admin') return {};

  if (user.roleName === 'manager') {
    const memberIds = await getGroupMemberIds(user.accountId);
    return { assignedToId: { in: [user.accountId, ...memberIds] } };
  }

  // staff and any other role: own inquiries only
  return { assignedToId: user.accountId };
};

//Ownership resolver for single inquiry access
const resolveInquiryOwnership = async (req) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return null;

  const scope = await buildInquiryScope(req.user);

  return prisma.inquiry.findFirst({
    where: { id, ...scope },
    include: {
      student: true,
      assignedTo: {
        select: { id: true, fullName: true, email: true }
      },
      sourceData: {
        select: { id: true, name: true, level: true }
      }
    }
  });
};

module.exports = {
  buildInquiryScope,
  resolveInquiryOwnership,
  getGroupMemberIds
};
