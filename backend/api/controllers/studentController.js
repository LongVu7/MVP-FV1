const prisma = require('../../config/db');
const xlsx = require('xlsx');
const fs = require('fs');

const createStudent = async (req, res) => {
  try {
    const student = req.body;

    const newStudent = await prisma.student.create({
      data: student
    });

    res.status(201).json({
      message: "Student created successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      student: newStudent
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create student", details: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: "Students retrieved successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      students: students
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students", details: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: Number(id) }
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({
      message: "Student retrieved successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: student
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student", details: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    // const studentId = parseInt(req.params.id, 10);
    // const updateData = req.body;
    const { id } = req.params;
    const {
      fullName,
      gender,
      email,
      mobile,
      otherPhone,
      parentPhone,
      birthDate,
      gpa,
      englishCertificate,
      primaryAddressCity
    } = req.body;


    const updatedStudent = await prisma.student.update({
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

    res.status(200).json({
      message: "Student updated successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update student", details: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({
      message: "Student deleted successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student", details: error.message });
  }
};

const importStudents = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const isConfirm = req.body.confirm === 'true' || req.body.confirm === true;
    const allStudents = [];
    const fileRowMapping = [];

    // 1. Read and parse all files
    for (const file of req.files) {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0]; // Assume first sheet
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      data.forEach((row, index) => {
        // Convert Excel serial date to JS Date if necessary
        if (row.birthDate && typeof row.birthDate === 'number') {
          row.birthDate = new Date(Math.round((row.birthDate - 25569) * 86400 * 1000));
        }

        allStudents.push(row);
        fileRowMapping.push({
          fileName: file.originalname,
          rowNumber: index + 2 // +2 because index is 0-based and row 1 is header
        });
      });
    }

    // 2. Identify duplicates based on `email`
    const emailsToChecking = allStudents.map(s => s.email).filter(Boolean);

    let existingEmails = new Set();
    if (emailsToChecking.length > 0) {
      const existingStudents = await prisma.student.findMany({
        where: { email: { in: emailsToChecking } },
        select: { email: true }
      });
      existingEmails = new Set(existingStudents.map(s => s.email));
    }

    // 3. Analyze duplicates
    const duplicates = [];
    allStudents.forEach((student, idx) => {
      if (student.email && existingEmails.has(student.email)) {
        duplicates.push({
          email: student.email,
          fullName: student.fullName,
          fileName: fileRowMapping[idx].fileName,
          rowNumber: fileRowMapping[idx].rowNumber,
          duplicatedColumn: "email"
        });
      }
    });

    if (!isConfirm) {
      // Just return analysis ("prompting")
      // Keep files for the actual import if you want, but standard REST 
      // usually requires re-uploading if confirming, or storing paths. 
      // We will clean up and ask client to re-submit with confirm=true.
      req.files.forEach(f => fs.unlinkSync(f.path));

      return res.status(200).json({
        message: "Analysis complete. Please confirm to proceed with UPSERT.",
        totalParsed: allStudents.length,
        duplicateCount: duplicates.length,
        duplicates: duplicates,
        requiresConfirmation: true
      });
    }

    // 4. Process UPSERT if confirm = true
    let insertedCount = 0;
    let updatedCount = 0;

    // Use transaction for bulk operations if needed, but sequential is safer for mixed upsert/create
    for (const studentData of allStudents) {
      if (studentData.email) {
        await prisma.student.upsert({
          where: { email: studentData.email },
          update: studentData,
          create: studentData
        });
        if (existingEmails.has(studentData.email)) {
          updatedCount++;
        } else {
          insertedCount++;
        }
      } else {
        await prisma.student.create({ data: studentData });
        insertedCount++;
      }
    }

    // Clean up files after successful import
    req.files.forEach(f => fs.unlinkSync(f.path));

    return res.status(200).json({
      message: "Import successful",
      insertedCount,
      updatedCount
    });

  } catch (error) {
    // Clean up files on error
    if (req.files) {
      req.files.forEach(f => {
        if (fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      });
    }
    res.status(500).json({ error: "Failed to import students", details: error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  importStudents,
  getStudentById
};
