const prisma = require('../../../config/db');
const { buildPaginationMeta } = require('../../utils/pagination');

// ─── Get all schools
const getAllSchools = async ({ page, limit, skip, cityId, search }) => {
  const where = {};
  if (cityId) where.cityId = Number(cityId);
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [schools, totalCount] = await Promise.all([
    prisma.school.findMany({
      where,
      skip,
      take: limit,
      include: { city: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' }
    }),
    prisma.school.count({ where })
  ]);

  return {
    schools,
    pagination: buildPaginationMeta(page, limit, totalCount)
  };
};

// ─── Get school options by city 
const getSchoolOptions = async (cityId) => {
  const where = {};
  if (cityId) where.cityId = Number(cityId);

  return prisma.school.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });
};

// ─── Get school by ID
const getSchoolById = async (id) => {
  const school = await prisma.school.findUnique({
    where: { id: Number(id) },
    include: { city: { select: { id: true, name: true } } }
  });

  if (!school) {
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }

  return school;
};

// ─── Create a school
const createSchool = async (data) => {
  // Verify city exists
  const city = await prisma.city.findUnique({ where: { id: data.cityId } });
  if (!city) {
    const err = new Error(`City with id ${data.cityId} does not exist`);
    err.status = 400;

    throw err;
  }

  try {
    return await prisma.school.create({ data });

  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error(`School "${data.name}" already exists in this city`);
      err.status = 409;
      
      throw err;
    }
    throw error;
  }
};

// ─── Update a school
const updateSchool = async (id, data) => {
  try {
    return await prisma.school.update({
      where: { id: Number(id) },
      data: { ...data, updatedAt: new Date() }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('School not found');
      err.status = 404;
      throw err;
    }
    if (error.code === 'P2002') {
      const err = new Error(`School "${data.name}" already exists in this city`);
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

// ─── Delete a school
const deleteSchool = async (id) => {
  // Prevent deletion if students are assigned
  const studentCount = await prisma.student.count({ where: { schoolId: Number(id) } });
  if (studentCount > 0) {
    const err = new Error(`Cannot delete school: ${studentCount} student(s) are still assigned`);
    err.status = 400;
    throw err;
  }

  try {
    await prisma.school.delete({ where: { id: Number(id) } });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('School not found');
      err.status = 404;
      throw err;
    }
    throw error;
  }
};

// ─── Statistics
const getStatistics = async () => {
  const [totalSchools, totalStudents, schoolsByCity] = await Promise.all([
    prisma.school.count(),
    prisma.student.count(),
    prisma.city.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { schools: true } }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return {
    totalSchools,
    totalStudents,
    schoolsByCity: schoolsByCity.map(c => ({
      cityId: c.id,
      cityName: c.name,
      schoolCount: c._count.schools
    }))
  };
};

module.exports = {
  getAllSchools,
  getSchoolOptions,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  getStatistics
};
