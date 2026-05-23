const prisma = require('../../../config/db');


const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });

    res.status(200).json({
      message: "Roles retrieved successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      roles
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles", details: error.message });
  }
};

module.exports = { getAllRoles };