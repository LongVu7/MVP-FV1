const prisma = require('../../../config/db');
const xlsx = require('xlsx');



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
    // if (error.code === 'P2002' && String(error.meta?.target).includes('email')) {
    //   const err = new Error(`Student with email "${data.email}" already exists`);
    //   err.status = 409;
    //   throw err;
    // }

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
const getAllStudents = async () => {
  return prisma.student.findMany({
    orderBy: { createdAt: 'desc' }
  });
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

// ─── Import students from parsed file buffers
// Receives array of { path, originalname } file objects and a confirm flag.
// Returns analysis result (if not confirmed) or import counts (if confirmed).
const importStudents = async (files, isConfirm) => {
  const allStudents = [];
  const fileRowMapping = [];

  // 1. Parse all files
  for (const file of files) {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    data.forEach((row, index) => {
      if (row.birthDate && typeof row.birthDate === 'number') {
        row.birthDate = new Date(Math.round((row.birthDate - 25569) * 86400 * 1000));
      }
      allStudents.push(row);
      fileRowMapping.push({ fileName: file.originalname, rowNumber: index + 2 });
    });
  }

  // 2. Identify duplicates by email
  const emailsToCheck = allStudents.map(s => s.email).filter(Boolean);
  let existingEmails = new Set();

  if (emailsToCheck.length > 0) {
    const existing = await prisma.student.findMany({
      where: { email: { in: emailsToCheck } },
      select: { email: true }
    });
    existingEmails = new Set(existing.map(s => s.email));
  }

  // 3. Build duplicates report
  const duplicates = allStudents
    .map((student, idx) => ({ student, mapping: fileRowMapping[idx] }))
    .filter(({ student }) => student.email && existingEmails.has(student.email))
    .map(({ student, mapping }) => ({
      email: student.email,
      fullName: student.fullName,
      fileName: mapping.fileName,
      rowNumber: mapping.rowNumber,
      duplicatedColumn: 'email'
    }));

  if (!isConfirm) {
    return {
      confirmed: false,
      totalParsed: allStudents.length,
      duplicateCount: duplicates.length,
      duplicates
    };
  }

  // 4. Upsert all records
  let insertedCount = 0;
  let updatedCount = 0;

  for (const studentData of allStudents) {
    if (studentData.email) {
      await prisma.student.upsert({
        where: { email: studentData.email },
        update: studentData,
        create: studentData
      });
      existingEmails.has(studentData.email) ? updatedCount++ : insertedCount++;
    } else {
      await prisma.student.create({ data: studentData });
      insertedCount++;
    }
  }

  return { confirmed: true, insertedCount, updatedCount };
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  importStudents
};
