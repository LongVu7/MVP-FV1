const prisma = require('../../../config/db');

// ─── List all inquiries 
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        students: true,
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Inquiries retrieved successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      inquiries: inquiries
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inquiries", details: error.message });
  }
};

// !-- Get specific inquiry --!
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: Number(id) },
      include: {
        students: true,
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    res.status(200).json({
      message: "Inquiry retrieved successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inquiry", details: error.message });
  }
};

// !-- Create inquiry --!
// With 3 methods
// 1. Create inquiry and link student records into inquiry
// 2. Create inquiry and new student record
// 3. Create inquiry without student record
const createInquiry = async (req, res) => {
  try {
    const {
      studentId,
      student,        // optional inline student object
      statusGeneral,
      statusDetail,
      leadSource,
      firstContactSource,
      priority,
      description,
      dataReceived,
      dataSource
    } = req.body;

    // Build the core inquiry data
    const inquiryData = {
      statusGeneral,
      statusDetail,
      leadSource,
      firstContactSource,
      priority,
      description,
      dataReceived: dataReceived ? new Date(dataReceived) : undefined,
      dataSource
    };

    // Assign to the requesting staff by default if no explicit assignee
    if (req.body.assignedToId) {
      inquiryData.assignedTo = { connect: { id: parseInt(req.body.assignedToId, 10) } };
    }

    let result;

    if (studentId) {
      // Create inquiry and link with existing student
      const existingStudent = await prisma.student.findUnique({
        where: { id: parseInt(studentId, 10) }
      });

      if (!existingStudent) {
        return res.status(404).json({ error: "Student not found with the provided studentId" });
      }

      result = await prisma.$transaction(async (tx) => {
        const newInquiry = await tx.inquiry.create({ data: inquiryData });

        // Link the student to this inquiry
        await tx.student.update({
          where: { id: parseInt(studentId, 10) },
          data: { inquiryId: newInquiry.id }
        });

        // Re-fetch with relations
        return tx.inquiry.findUnique({
          where: { id: newInquiry.id },
          include: { students: true, assignedTo: { select: { id: true, fullName: true, email: true } } }
        });
      });

    } else if (student && student.fullName) {
      // !-- Create inquiry case with creating new student --!
      result = await prisma.$transaction(async (tx) => {
        const newInquiry = await tx.inquiry.create({ data: inquiryData });

        // Create the new student and link to this inquiry
        await tx.student.create({
          data: {
            ...student,
            birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
            inquiryId: newInquiry.id
          }
        });

        return tx.inquiry.findUnique({
          where: { id: newInquiry.id },
          include: { students: true, assignedTo: { select: { id: true, fullName: true, email: true } } }
        });
      });

    } else {
      // !-- Create inquiry case without student --!
      const newInquiry = await prisma.inquiry.create({ data: inquiryData });
      result = await prisma.inquiry.findUnique({
        where: { id: newInquiry.id },
        include: { students: true, assignedTo: { select: { id: true, fullName: true, email: true } } }
      });
    }

    res.status(201).json({
      message: "Inquiry created successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create inquiry", details: error.message });
  }
};

// !-- Update inquiry --! 
const updateInquiry = async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const updateData = req.body;

    // Auto-set updatedAt timestamp
    updateData.updatedAt = new Date();

    // Convert date string if present
    if (updateData.dataReceived) {
      updateData.dataReceived = new Date(updateData.dataReceived);
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: updateData,
      include: {
        students: true,
        assignedTo: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    res.status(200).json({
      message: "Inquiry updated successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update inquiry", details: error.message });
  }
};

// ─── Delete inquiry (preserves student records) ───────────────────────────────
const deleteInquiry = async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);

    await prisma.$transaction(async (tx) => {
      // Unlink all students from this inquiry so they are NOT deleted
      await tx.student.updateMany({
        where: { inquiryId: inquiryId },
        data: { inquiryId: null }
      });

      // Now safely delete the inquiry
      await tx.inquiry.delete({
        where: { id: inquiryId }
      });
    });

    res.status(200).json({
      message: "Inquiry deleted successfully. Associated student records were preserved.",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete inquiry", details: error.message });
  }
};

// ─── Assign a student to an inquiry ───────────────────────────────────────────
const assignStudentToInquiry = async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required in the request body" });
    }

    // Verify both records exist
    const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId, 10) } });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Link the student to the inquiry
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(studentId, 10) },
      data: { inquiryId: inquiryId }
    });

    res.status(200).json({
      message: "Student assigned to inquiry successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: {
        inquiryId: inquiryId,
        student: updatedStudent
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign student to inquiry", details: error.message });
  }
};

// ─── Assign a staff member to an inquiry ──────────────────────────────────────
const assignStaffToInquiry = async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ error: "staffId is required in the request body" });
    }

    // Verify the staff account exists
    const staffAccount = await prisma.account.findUnique({ where: { id: parseInt(staffId, 10) } });
    if (!staffAccount) {
      return res.status(404).json({ error: "Staff account not found" });
    }

    // Update the inquiry's assigned staff
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        assignedToId: parseInt(staffId, 10),
        updatedAt: new Date()
      },
      include: {
        students: true,
        assignedTo: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    res.status(200).json({
      message: "Staff assigned to inquiry successfully",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign staff to inquiry", details: error.message });
  }
};

// ─── Search students (for assignment UI) ──────────────────────────────────────
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 20,
      orderBy: { fullName: 'asc' }
    });

    res.status(200).json({
      message: "Students search results",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      results: students
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to search students", details: error.message });
  }
};

// ─── Search staff accounts (for assignment UI) ────────────────────────────────
const searchStaff = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const staff = await prisma.account.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: {
          select: { name: true }
        }
      },
      take: 20,
      orderBy: { fullName: 'asc' }
    });

    res.status(200).json({
      message: "Staff search results",
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      results: staff
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to search staff", details: error.message });
  }
};

module.exports = {
  getAllInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  assignStudentToInquiry,
  assignStaffToInquiry,
  searchStudents,
  searchStaff
};
