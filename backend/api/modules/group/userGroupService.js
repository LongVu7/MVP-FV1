const prisma = require('../../../config/db');

// Shared include shapes
const groupInclude = {
  groupLeader: {
    select: { id: true, fullName: true, email: true }
  },
  accounts: {
    select: { id: true, fullName: true, email: true, isActive: true }
  }
};

const groupIncludeWithRole = {
  groupLeader: {
    select: { id: true, fullName: true, email: true }
  },
  accounts: {
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      role: { select: { id: true, name: true } }
    }
  }
};

// ─── List all groups
const getAllGroups = async () => {
  const groups = await prisma.userGroup.findMany({
    orderBy: { id: 'desc' },
    include: groupInclude
  });

  return groups.map(group => ({ ...group, memberCount: group.accounts.length }));
};

// ─── Get single group by ID
const getGroupById = async (id) => {
  const group = await prisma.userGroup.findUnique({
    where: { id: Number(id) },
    include: groupIncludeWithRole
  });

  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }

  return { ...group, memberCount: group.accounts.length };
};

// ─── Create group
const createGroup = async (name, groupLeaderId) => {
  if (!name?.trim()) {
    const err = new Error('Group name is required');
    err.status = 400;
    throw err;
  }

  const leaderId = groupLeaderId ? Number(groupLeaderId) : null;

  if (leaderId) {
    const leader = await prisma.account.findUnique({ where: { id: leaderId } });
    if (!leader) {
      const err = new Error('Group leader account not found');
      err.status = 404;
      throw err;
    }
  }

  return prisma.userGroup.create({
    data: { name: name.trim(), groupLeaderId: leaderId },
    include: groupInclude
  });
};

// ─── Update group (name and/or leader)
const updateGroup = async (id, { name, groupLeaderId }) => {
  const existing = await prisma.userGroup.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }

  if (groupLeaderId !== undefined && groupLeaderId !== null) {
    const leader = await prisma.account.findUnique({ where: { id: Number(groupLeaderId) } });
    if (!leader) {
      const err = new Error('Group leader account not found');
      err.status = 404;
      throw err;
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (groupLeaderId !== undefined) updateData.groupLeaderId = groupLeaderId ? Number(groupLeaderId) : null;

  return prisma.userGroup.update({
    where: { id: Number(id) },
    data: updateData,
    include: groupInclude
  });
};

// ─── Delete group
const deleteGroup = async (id) => {
  const existing = await prisma.userGroup.findUnique({
    where: { id: Number(id) },
    select: { id: true }
  });

  if (!existing) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.updateMany({
      where: { groupId: Number(id) },
      data: { groupId: null }
    });
    await tx.userGroup.delete({ where: { id: Number(id) } });
  });
};

// ─── Add member to group
const addMemberToGroup = async (groupId, accountId) => {
  const group = await prisma.userGroup.findUnique({ where: { id: Number(groupId) } });
  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }

  const account = await prisma.account.findUnique({ where: { id: Number(accountId) } });
  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }

  if (account.groupId === Number(groupId)) {
    const err = new Error('Account is already a member of this group');
    err.status = 409;
    throw err;
  }

  return prisma.account.update({
    where: { id: Number(accountId) },
    data: { groupId: Number(groupId) },
    select: {
      id: true,
      fullName: true,
      email: true,
      group: { select: { id: true, name: true } }
    }
  });
};

// ─── Remove member from group
const removeMemberFromGroup = async (groupId, accountId) => {
  const group = await prisma.userGroup.findUnique({ where: { id: Number(groupId) } });
  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }

  const account = await prisma.account.findUnique({ where: { id: Number(accountId) } });
  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }

  if (account.groupId !== Number(groupId)) {
    const err = new Error('Account is not a member of this group');
    err.status = 400;
    throw err;
  }

  return prisma.account.update({
    where: { id: Number(accountId) },
    data: { groupId: null },
    select: {
      id: true,
      fullName: true,
      email: true,
      group: { select: { id: true, name: true } }
    }
  });
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup
};
