const prisma = require('../../../config/db');
const xlsx = require('xlsx');
const { buildPaginationMeta } = require('../../utils/pagination');



// ─── Create a student
const createStudent = async (data) => {
  try {
    return await prisma.student.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined
      }
    });
  } catch (error) {

    if (error.code === 'P2002') {
      const err = new Error(
        `Student with email "${data.email}" already exists`
      )
      err.status = 409
      // console.log(err)
      throw err
    }

    throw error
  }
};


// ─── Get all students
const getAllStudents = async ({ page, limit, skip, search }) => {
  const where = {};
  if (search) {
    where.OR = [
      { mobile: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [students, totalCount] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.student.count({ where })
  ]);

  return {
    students,
    pagination: buildPaginationMeta(page, limit, totalCount)
  };
};

// ─── Get student by ID
const getStudentById = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(id) }
  });

  if (!student) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  return student;
};

// ─── Update a student
const updateStudent = async (id, { fullName, gender, email, mobile, otherPhone, parentPhone, birthDate, gpa, englishCertificate, primaryAddressCity }) => {
  return prisma.student.update({
    where: { id: Number(id) },
    data: {
      fullName,
      gender,
      email,
      mobile,
      otherPhone,
      parentPhone,
      birthDate,
      gpa,
      englishCertificate,
      primaryAddressCity,
      updatedAt: new Date()
    }
  });
};

// ─── Delete a student
const deleteStudent = async (id) => {
  await prisma.student.delete({ where: { id: Number(id) } });
};

// ─── Import students analysis
const analyzeImport = async (parsedStudents) => {
  const duplicates = [];
  const mobileMap = new Map();

  // 1. In-file duplicate detection
  parsedStudents.forEach((student) => {
    if (student.mobile) {
      if (mobileMap.has(student.mobile)) {
        mobileMap.get(student.mobile).push(student);
      } else {
        mobileMap.set(student.mobile, [student]);
      }
    }
  });

  for (const [mobile, studentsWithMobile] of mobileMap.entries()) {
    if (studentsWithMobile.length > 1) {
      studentsWithMobile.forEach(student => {
        duplicates.push({
          mobile: student.mobile,
          fullName: student.fullName,
          fileName: student._mapping?.fileName,
          rowNumber: student._mapping?.rowNumber,
          duplicatedType: 'file',
          message: 'Duplicate mobile number found within the uploaded files.'
        });
      });
    }
  }

  // 2. Database duplicate detection
  const mobilesToCheck = Array.from(mobileMap.keys());
  let existingMobiles = new Set();

  if (mobilesToCheck.length > 0) {
    const existing = await prisma.student.findMany({
      where: { mobile: { in: mobilesToCheck } },
      select: { mobile: true }
    });
    existingMobiles = new Set(existing.map(s => s.mobile));
  }

  parsedStudents.forEach(student => {
    if (student.mobile && existingMobiles.has(student.mobile)) {
      duplicates.push({
        mobile: student.mobile,
        fullName: student.fullName,
        fileName: student._mapping?.fileName,
        rowNumber: student._mapping?.rowNumber,
        duplicatedType: 'db',
        message: 'Mobile number already exists in the database. Record will be updated.'
      });
    }
  });

  return {
    totalParsed: parsedStudents.length,
    duplicateCount: duplicates.length,
    duplicates,
    parsedStudents
  };
};

// ─── Process confirmed import
const processImport = async (students) => {
  // 1. Re-validate
  const mobileSet = new Set();
  const validStudents = [];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (!s.mobile) {
      const err = new Error(`Row ${i + 1} (${s.fullName || 'Unknown'}): Mobile number is required.`);
      err.status = 400;
      throw err;
    }

    if (mobileSet.has(s.mobile)) {
      const err = new Error(`Duplicate mobile number (${s.mobile}) found in the confirmation payload.`);
      err.status = 400;
      throw err;
    }
    mobileSet.add(s.mobile);

    // Clean up non-db fields before saving
    const { _mapping, ...dbData } = s;
    validStudents.push(dbData);
  }

  // 2. Perform Transaction
  const existingRecords = await prisma.student.findMany({
    where: { mobile: { in: Array.from(mobileSet) } },
    select: { mobile: true }
  });
  const existingMobiles = new Set(existingRecords.map(r => r.mobile));

  let insertedCount = 0;
  let updatedCount = 0;

  const transactionOperations = validStudents.map(studentData => {
    if (existingMobiles.has(studentData.mobile)) {
      updatedCount++;
    } else {
      insertedCount++;
    }
    
    // Convert string to Date if needed
    if (studentData.birthDate) {
      studentData.birthDate = new Date(studentData.birthDate);
    }
    
    return prisma.student.upsert({
      where: { mobile: studentData.mobile },
      update: studentData,
      create: studentData
    });
  });

  await prisma.$transaction(transactionOperations);

  return { insertedCount, updatedCount };
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  analyzeImport,
  processImport
}; 
