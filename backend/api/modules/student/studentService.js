const prisma = require('../../../config/db');
const xlsx = require('xlsx');
const { buildPaginationMeta } = require('../../utils/pagination');



// ─── Create a student
const createStudent = async (data) => {
  const { specializedRegister, schoolId, ...studentData } = data;
  try {
    return await prisma.student.create({
      data: {
        ...studentData,
        birthDate: studentData.birthDate ? new Date(studentData.birthDate) : undefined,
        ...(schoolId ? {
          school: {
            connect: { id: schoolId }
          }
        } : {}),
        ...(specializedRegister && {
          specializedRegister: {
            create: specializedRegister
          }
        })
      },
      include: {
        specializedRegister: {
          include: {
            interestedMajor: { select: { id: true, name: true } },
            specificMajor: { select: { id: true, name: true } }
          }
        }
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

  const [students, totalCount] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: { 
        school: { select: { id: true, name: true, city: { select: { id: true, name: true } } } },
        specializedRegister: {
          include: {
            interestedMajor: { select: { id: true, name: true } },
            specificMajor: { select: { id: true, name: true } }
          }
        }
      },
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
    where: { id: Number(id) },
    include: { 
      school: { select: { id: true, name: true, city: { select: { id: true, name: true } } } },
      specializedRegister: {
        include: {
          interestedMajor: { select: { id: true, name: true } },
          specificMajor: { select: { id: true, name: true } }
        }
      }
    }
  });

  if (!student) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  return student;
};

// ─── Update a student
const updateStudent = async (id, data) => {
  const { specializedRegister, schoolId, ...studentData } = data;
  
  const schoolUpdate = schoolId === null 
    ? { disconnect: true } 
    : (schoolId ? { connect: { id: schoolId } } : undefined);

  return prisma.student.update({
    where: { id: Number(id) },
    data: {
      ...studentData,
      birthDate: studentData.birthDate ? new Date(studentData.birthDate) : studentData.birthDate,
      updatedAt: new Date(),
      ...(schoolUpdate && { school: schoolUpdate }),
      ...(specializedRegister !== undefined && {
        specializedRegister: {
          upsert: {
            create: specializedRegister,
            update: specializedRegister
          }
        }
      })
    },
    include: {
      specializedRegister: {
        include: {
          interestedMajor: { select: { id: true, name: true } },
          specificMajor: { select: { id: true, name: true } }
        }
      }
    }
  });
};

// ─── Delete a student
const deleteStudent = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(id) },
    select: { specializedRegisterId: true }
  });

  await prisma.student.delete({ where: { id: Number(id) } });

  if (student?.specializedRegisterId) {
    await prisma.specializedRegister.delete({
      where: { id: student.specializedRegisterId }
    });
  }
};

// ─── Import students analysis
const analyzeImport = async (parsedStudents) => {
  const duplicates = [];
  const mobileMap = new Map();

  // Check duplicate mobile numbers in the uploaded files
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

  // Check duplicate mobile numbers in the database
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
    // Separate SpecializedRegister fields from Student fields
    const { 
      specializedRegister: existingSR, 
      gpa, englishCertificate, interestedMajor, specificMajor, admissionYear, programScore,
      schoolId,
      ...dbData 
    } = studentData;

    // Merge any loose SR fields with the existing nested object
    const srFields = { gpa, englishCertificate, interestedMajor, specificMajor, admissionYear, programScore };
    // Remove undefined keys
    Object.keys(srFields).forEach(k => srFields[k] === undefined && delete srFields[k]);
    
    const specializedRegister = Object.keys(srFields).length > 0 
      ? { ...existingSR, ...srFields } 
      : existingSR;

    if (existingMobiles.has(dbData.mobile)) {
      updatedCount++;
    } else {
      insertedCount++;
    }
    
    // Convert string to Date if needed
    if (dbData.birthDate) {
      dbData.birthDate = new Date(dbData.birthDate);
    }
    
    const schoolUpdate = schoolId === null 
      ? { disconnect: true } 
      : (schoolId ? { connect: { id: schoolId } } : undefined);

    return prisma.student.upsert({
      where: { mobile: dbData.mobile },
      update: {
        ...dbData,
        ...(schoolUpdate && { school: schoolUpdate }),
        ...(specializedRegister && {
          specializedRegister: {
            upsert: {
              create: specializedRegister,
              update: specializedRegister
            }
          }
        })
      },
      create: {
        ...dbData,
        ...(schoolId ? {
          school: {
            connect: { id: schoolId }
          }
        } : {}),
        ...(specializedRegister && {
          specializedRegister: {
            create: specializedRegister
          }
        })
      }
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
