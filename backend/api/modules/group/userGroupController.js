const prisma = require('../../../config/db');

// ─── List all groups
const getAllGroups = async (req, res) => {
  try {
    const groups = await prisma.userGroup.findMany({
      orderBy: { id: 'desc' },
      include: {
        groupLeader: {
          select: { id: true, fullName: true, email: true }
        },
        accounts: {
          select: { id: true, fullName: true, email: true, isActive: true }
        }
      }
    });

    // Count member of group
    const groupsWithCount = groups.map(group => ({
      ...group,
      memberCount: group.accounts.length
    }));

    res.status(200).json({
      message: "Get all groups successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      totalGroups: groupsWithCount.length,
      groups: groupsWithCount
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all groups", details: error.message });
  }
};

// ─── Get single group by ID
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.userGroup.findUnique({
      where: { id: Number(id) },
      include: {
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
      }
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupWithCount = {
      ...group,
      memberCount: group.accounts.length
    };

    res.status(200).json({
      message: "Get group by ID successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: groupWithCount
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch group", details: error.message });
  }
};

// ─── Create group
const createGroup = async (req, res) => {
  try {
    const { name, groupLeaderId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const leaderId = groupLeaderId ? Number(groupLeaderId) : null;

    // Validate group leader if provided
    if (leaderId) {
      const leader = await prisma.account.findUnique({ where: { id: leaderId } });
      if (!leader) {
        return res.status(404).json({ error: "Group leader account not found" });
      }
    }

    const newGroup = await prisma.userGroup.create({
      data: {
        name: name.trim(),
        groupLeaderId: leaderId
      },
      include: {
        groupLeader: {
          select: { id: true, fullName: true, email: true }
        },
        accounts: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: "Group created successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: newGroup
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create group", details: error.message });
  }
};

// ─── Update group (name and/or leader)
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, groupLeaderId } = req.body;

    const existing = await prisma.userGroup.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Validate new leader if provided
    if (groupLeaderId !== undefined && groupLeaderId !== null) {
      const leader = await prisma.account.findUnique({ where: { id: Number(groupLeaderId) } });
      if (!leader) {
        return res.status(404).json({ error: "Group leader account not found" });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (groupLeaderId !== undefined) updateData.groupLeaderId = groupLeaderId ? Number(groupLeaderId) : null;

    const updatedGroup = await prisma.userGroup.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        groupLeader: {
          select: { id: true, fullName: true, email: true }
        },
        accounts: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    res.status(200).json({
      message: "Group updated successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update group", details: error.message });
  }
};

// ─── Delete group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.userGroup.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true }
    });
    if (!existing) {
      return res.status(404).json({ error: "Group not found" });
    }

    await prisma.$transaction(async (tx) => {
      // Unlink all members from this group
      await tx.account.updateMany({
        where: { groupId: Number(id) },
        data: { groupId: null }
      });

      // Delete the group
      await tx.userGroup.delete({ where: { id: Number(id) } });
    });

    res.status(200).json({
      message: "Group deleted successfully. Member accounts were preserved.",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete group", details: error.message });
  }
};

// ─── Add member to group
const addMemberToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required in the request body" });
    }

    // Verify group exists
    const group = await prisma.userGroup.findUnique({ where: { id: Number(id) } });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Verify account exists
    const account = await prisma.account.findUnique({ where: { id: Number(accountId) } });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Check if already in this group
    if (account.groupId === Number(id)) {
      return res.status(409).json({ error: "Account is already a member of this group" });
    }

    const updatedAccount = await prisma.account.update({
      where: { id: Number(accountId) },
      data: { groupId: Number(id) },
      select: {
        id: true,
        fullName: true,
        email: true,
        group: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      message: "Member added to group successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: updatedAccount
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add member to group", details: error.message });
  }
};

// ─── Remove member from group
const removeMemberFromGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required in the request body" });
    }

    // Verify group exists
    const group = await prisma.userGroup.findUnique({ where: { id: Number(id) } });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Verify account exists and is in this group
    const account = await prisma.account.findUnique({ where: { id: Number(accountId) } });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (account.groupId !== Number(id)) {
      return res.status(400).json({ error: "Account is not a member of this group" });
    }

    const updatedAccount = await prisma.account.update({
      where: { id: Number(accountId) },
      data: { groupId: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        group: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      message: "Member removed from group successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      memberDeleted: updatedAccount
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member from group", details: error.message });
  }
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