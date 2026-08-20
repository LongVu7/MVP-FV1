const prisma = require('../../../config/db');
const xlsx = require('xlsx');
const { buildPaginationMeta } = require('../../utils/pagination');



// ─── Create a student
const createStudent = async (data) => {
  const { specializedRegister, education, ...studentData } = data;
  try {
    return await prisma.$transaction(async (tx) => {
      return await tx.student.create({
        data: {
          ...studentData,
          birthDate: studentData.birthDate ? new Date(studentData.birthDate) : undefined,
          ...(education && {
            education: {
              create: education
            }
          }),
          ...(specializedRegister && {
            specializedRegister: {
              create: specializedRegister
            }
          })
        },
      include: {
        education: {
          include: {
            school: { select: { id: true, name: true, oldProvince: { select: { id: true, name: true } } } },
            newProvince: { select: { id: true, name: true } },
            country: { select: { id: true, name: true } }
          }
        },
        specializedRegister: {
          include: {
            interestedMajor: { select: { id: true, name: true } },
            specificMajor: { select: { id: true, name: true } }
          }
        }
      }
    });
  });
  } catch (error) {

    if (error.code === 'P2002') {
      const fields = error.meta?.target || error.meta?.driverAdapterError?.cause?.constraint?.fields || [];
      let message = 'A student with this data already exists';
      if (fields.includes('mobile')) {
        message = `Student with mobile "${data.mobile}" already exists`;
      }
      const err = new Error(message);
      err.status = 409;
      throw err;
    }

    throw error
  }
};


// ─── Get all students
const getAllStudents = async ({ page, limit, skip, search, sortField, sortOrder, oldProvinceId, newProvinceId, countryId, provinceGroup, schoolType, birthYear }) => {
  const where = {};
  if (search) {
    where.OR = [
      { mobile: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } }
    ];
  }
  //Filter by birthYear
  if (birthYear) {
    const year = parseInt(birthYear, 10);
    where.birthDate = {
      gte: new Date(`${year}-01-01T00:00:00.000Z`),
      lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
    };
  }

  let orderBy = { createdAt: 'desc' };
  if (sortField) {
    const order = sortOrder === 1 ? 'asc' : 'desc';
    if (sortField === 'education.school.name') {
      orderBy = { education: { school: { name: order } } };
    } else {
      orderBy = { [sortField]: order };
    }
  }

  const [students, totalCount] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: { 
        education: {
          include: {
            school: { select: { id: true, name: true, oldProvince: { select: { id: true, name: true } } } },
            newProvince: { select: { id: true, name: true } },
            country: { select: { id: true, name: true } }
          }
        },
        specializedRegister: {
          include: {
            interestedMajor: { select: { id: true, name: true } },
            specificMajor: { select: { id: true, name: true } }
          }
        }
      },
      orderBy
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
      education: {
        include: {
          school: { select: { id: true, name: true, oldProvince: { select: { id: true, name: true } } } },
          newProvince: { select: { id: true, name: true } },
          country: { select: { id: true, name: true } }
        }
      },
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
  const { specializedRegister, education, ...studentData } = data;

  try {
    return await prisma.$transaction(async (tx) => {
      // First update the student details
      const studentUpdate = await tx.student.update({
        where: { id: Number(id) },
        data: {
          ...studentData,
          birthDate: studentData.birthDate ? new Date(studentData.birthDate) : studentData.birthDate,
          updatedAt: new Date(),
          ...(specializedRegister !== undefined && {
            specializedRegister: {
              upsert: {
                create: specializedRegister,
                update: specializedRegister
              }
            }
          })
        },
      });

      // Then conditionally upsert or delete the education record
      if (education !== undefined) {
        if (education === null) {
          await tx.studentEducation.deleteMany({
            where: { studentId: Number(id) }
          });
        } else {
          await tx.studentEducation.upsert({
            where: { studentId: Number(id) },
            create: {
              studentId: Number(id),
              ...education
            },
            update: {
              ...education
            }
          });
        }
      }

      // Finally, fetch and return the complete student
      return await tx.student.findUnique({
        where: { id: Number(id) },
        include: {
          education: {
            include: {
              school: { select: { id: true, name: true, oldProvince: { select: { id: true, name: true } } } },
              newProvince: { select: { id: true, name: true } },
              country: { select: { id: true, name: true } }
            }
          },
          specializedRegister: {
            include: {
              interestedMajor: { select: { id: true, name: true } },
              specificMajor: { select: { id: true, name: true } }
            }
          }
        }
      });
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const fields = error.meta?.target || error.meta?.driverAdapterError?.cause?.constraint?.fields || [];
      let message = 'A student with this data already exists';
      if (fields.includes('mobile')) {
        message = `Student with mobile "${data.mobile}" already exists`;
      }
      const err = new Error(message);
      err.status = 409;
      throw err;
    }
    throw error;
  }
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

  // ─── Resolve schoolCity + school names to schoolId ───
  const schoolWarnings = [];
  const studentsNeedingSchoolLookup = parsedStudents.filter(
    s => s.school && s.schoolCity && !s.schoolId
  );

  if (studentsNeedingSchoolLookup.length > 0) {
    // Get unique city names
    const cityNames = [...new Set(studentsNeedingSchoolLookup.map(s => String(s.schoolCity).trim()))];
    
    // Fetch cities with their schools in one query
    const cities = await prisma.oldProvince.findMany({
      where: { name: { in: cityNames, mode: 'insensitive' } },
      include: { schools: { select: { id: true, name: true } } }
    });

    // Build lookup: cityName (lowercase) → { cityId, schools: Map<schoolName(lowercase), schoolId> }
    const cityLookup = new Map();
    cities.forEach(city => {
      const schoolMap = new Map();
      city.schools.forEach(school => {
        schoolMap.set(school.name.toLowerCase().trim(), school.id);
      });
      cityLookup.set(city.name.toLowerCase().trim(), { cityId: city.id, schools: schoolMap });
    });

    // Resolve each student's schoolId
    for (const student of parsedStudents) {
      if (student.school && student.schoolCity && !student.schoolId) {
        const cityKey = String(student.schoolCity).toLowerCase().trim();
        const schoolKey = String(student.school).toLowerCase().trim();
        const cityEntry = cityLookup.get(cityKey);

        if (!cityEntry) {
          schoolWarnings.push({
            mobile: student.mobile,
            fullName: student.fullName,
            fileName: student._mapping?.fileName,
            rowNumber: student._mapping?.rowNumber,
            message: `City "${student.schoolCity}" not found in database.`
          });
        } else {
          const schoolId = cityEntry.schools.get(schoolKey);
          if (schoolId) {
            student.schoolId = schoolId;
          } else {
            schoolWarnings.push({
              mobile: student.mobile,
              fullName: student.fullName,
              fileName: student._mapping?.fileName,
              rowNumber: student._mapping?.rowNumber,
              message: `School "${student.school}" not found in city "${student.schoolCity}".`
            });
          }
        }
      }
    }
  }

  return {
    totalParsed: parsedStudents.length,
    duplicateCount: duplicates.length,
    duplicates,
    schoolWarnings,
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
    // Separate SpecializedRegister fields and Excel-only lookup fields from Student fields
    // Accept both interestedMajor/specificMajor (legacy) and interestedMajorId/specificMajorId
    const { 
      specializedRegister: existingSR, 
      gpa, englishCertificate, 
      interestedMajor, specificMajor,
      interestedMajorId, specificMajorId,
      admissionYear, programScore,
      schoolId,
      school: _school, schoolCity: _schoolCity,  // Excel-only lookup fields (already resolved to schoolId)
      ...dbData 
    } = studentData;

    // Build SR fields — convert empty strings to null for enum fields
    const cleanEnum = (val) => (val === '' || val === null || val === undefined) ? undefined : val;
    const cleanInt = (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    };

    const srFields = {};
    const gpaVal = cleanEnum(gpa);
    const englishCertVal = cleanEnum(englishCertificate);
    const programScoreVal = cleanEnum(programScore);
    const admissionYearVal = cleanInt(admissionYear);
    const interestedMajorIdVal = cleanInt(interestedMajorId || interestedMajor);
    const specificMajorIdVal = cleanInt(specificMajorId || specificMajor);

    if (gpaVal !== undefined) srFields.gpa = gpaVal;
    if (englishCertVal !== undefined) srFields.englishCertificate = englishCertVal;
    if (programScoreVal !== undefined) srFields.programScore = programScoreVal;
    if (admissionYearVal !== undefined) srFields.admissionYear = admissionYearVal;
    if (interestedMajorIdVal !== undefined) srFields.interestedMajorId = interestedMajorIdVal;
    if (specificMajorIdVal !== undefined) srFields.specificMajorId = specificMajorIdVal;

    const specializedRegister = Object.keys(srFields).length > 0 
      ? { ...(existingSR || {}), ...srFields } 
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
    
    const educationUpsert = schoolId !== undefined ? {
      upsert: {
        create: { schoolId: schoolId === null ? undefined : schoolId },
        update: { schoolId: schoolId === null ? null : schoolId }
      }
    } : undefined;

    return prisma.student.upsert({
      where: { mobile: dbData.mobile },
      update: {
        ...dbData,
        ...(educationUpsert && { education: educationUpsert }),
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
          education: {
            create: { schoolId }
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
