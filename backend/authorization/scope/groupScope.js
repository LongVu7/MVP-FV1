const prisma = require('../../config/db');

// ─── Build Prisma WHERE scope for group queries
const buildGroupScope = (user) => {
  if (user.roleName === 'admin') return {};
  
  if (user.roleName === 'manager') {
    return { createdById: user.accountId };
  }

  // staff: view groups they belong to
  return { accounts: { some: { id: user.accountId } } };
};

// ─── Ownership resolver for single group access
const resolveGroupOwnership = async (req) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return null;

  const scope = buildGroupScope(req.user);

  return prisma.userGroup.findFirst({
    where: { id, ...scope },
    include: {
      groupLeader: { select: { id: true, fullName: true, email: true } },
      accounts: {
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          role: { select: { id: true, name: true } }
        }
      }
    }
  });
};

module.exports = {
  buildGroupScope,
  resolveGroupOwnership
};
