const prisma = require('../../../config/db');


const handleError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Inquiry queries
const inquiryInclude = {
  students: true,
  assignedTo: {
    select: { id: true, fullName: true, email: true }
  }
};

// ─── List all inquiries
const getAllInquiries = async () => {
  return prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: inquiryInclude
  });
};

// ─── Get specific inquiry by ID
const getInquiryById = async (id) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: Number(id) },
    include: inquiryInclude
  });

  if (!inquiry) {
    return handleError('Inquiry not found', 404);
  }

  return inquiry;
};

// Create inquiry with 3 methods
// 1. Link existing student
// 2. Create new student with the inquiry
// 3. Create inquiry with no student
const createInquiry = async ({ studentId, student, assignedToId, ...inquiryFields }) => {
  const inquiryData = {
    ...inquiryFields,
    dataReceived: inquiryFields.dataReceived ? new Date(inquiryFields.dataReceived) : undefined
  };

  if (assignedToId) {
    inquiryData.assignedTo = { connect: { id: parseInt(assignedToId, 10) } };
  }

  // ─── Create inquiry with an existing student
  if (studentId) {
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(studentId, 10) }
    });

    if (!existingStudent) {
      return handleError('Student not found with the provided studentId', 404);
    }

    return prisma.$transaction(async (tx) => {
      const newInquiry = await tx.inquiry.create({ data: inquiryData });

      await tx.student.update({
        where: { id: parseInt(studentId, 10) },
        data: { inquiryId: newInquiry.id }
      });

      return tx.inquiry.findUnique({
        where: { id: newInquiry.id },
        include: inquiryInclude
      });
    });
  }

  // Create a new student with the inquiry
  if (student && student.fullName) {
    return prisma.$transaction(async (tx) => {
      const newInquiry = await tx.inquiry.create({ data: inquiryData });

      await tx.student.create({
        data: {
          ...student,
          birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
          inquiryId: newInquiry.id
        }
      });

      return tx.inquiry.findUnique({
        where: { id: newInquiry.id },
        include: inquiryInclude
      });
    });
  }

  //Create inquiry with no student
  const newInquiry = await prisma.inquiry.create({ data: inquiryData });
  return prisma.inquiry.findUnique({
    where: { id: newInquiry.id },
    include: inquiryInclude
  });
};

// ─── Update inquiry
const updateInquiry = async (id, updateData) => {
  const data = {
    ...updateData,
    updatedAt: new Date(),
    ...(updateData.dataReceived && { dataReceived: new Date(updateData.dataReceived) })
  };

  return prisma.inquiry.update({
    where: { id: parseInt(id, 10) },
    data,
    include: inquiryInclude
  });
};

// ─── Delete inquiry (preserves student records)
const deleteInquiry = async (id) => {
  const inquiryId = parseInt(id, 10);

  await prisma.$transaction(async (tx) => {
    await tx.student.updateMany({
      where: { inquiryId },
      data: { inquiryId: null }
    });

    await tx.inquiry.delete({ where: { id: inquiryId } });
  });
};

// ─── Assign a student to an inquiry
const assignStudentToInquiry = async (inquiryId, studentId) => {
  const inquiry = await prisma.inquiry.findUnique({ where: { id: parseInt(inquiryId, 10) } });
  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.status = 404;
    throw err;
  }

  const student = await prisma.student.findUnique({ where: { id: parseInt(studentId, 10) } });
  if (!student) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  const updatedStudent = await prisma.student.update({
    where: { id: parseInt(studentId, 10) },
    data: { inquiryId: parseInt(inquiryId, 10) }
  });

  return { inquiryId: parseInt(inquiryId, 10), student: updatedStudent };
};

// ─── Unassign a student from an inquiry
const unassignStudentFromInquiry = async (inquiryId, studentId) => {
  const student = await prisma.student.findUnique({ where: { id: parseInt(studentId, 10) } });
  if (!student) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  if (student.inquiryId !== parseInt(inquiryId, 10)) {
    const err = new Error('Student is not linked to this inquiry');
    err.status = 400;
    throw err;
  }

  await prisma.student.update({
    where: { id: parseInt(studentId, 10) },
    data: { inquiryId: null }
  });
};

// ─── Assign an account to an inquiry
const assignAccountToInquiry = async (inquiryId, accountId) => {
  const account = await prisma.account.findUnique({ where: { id: parseInt(accountId, 10) } });
  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }

  return prisma.inquiry.update({
    where: { id: parseInt(inquiryId, 10) },
    data: {
      assignedToId: parseInt(accountId, 10),
      updatedAt: new Date()
    },
    include: inquiryInclude
  });
};

// ─── Search students (for assignment UI)
const searchStudents = async (query) => {
  return prisma.student.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 20,
    orderBy: { fullName: 'asc' }
  });
};

// ─── Search staff accounts (for assignment UI)
const searchStaff = async (query) => {
  return prisma.account.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: { select: { name: true } }
    },
    take: 20,
    orderBy: { fullName: 'asc' }
  });
};

module.exports = {
  getAllInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  assignStudentToInquiry,
  unassignStudentFromInquiry,
  assignAccountToInquiry,
  searchStudents,
  searchStaff
};
