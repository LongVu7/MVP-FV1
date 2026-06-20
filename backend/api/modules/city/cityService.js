const prisma = require('../../../config/db');

// ─── Get all cities (sorted by name, minimal fields for dropdown)
const getAllCities = async () => {
  return prisma.city.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });
};

module.exports = { getAllCities };
