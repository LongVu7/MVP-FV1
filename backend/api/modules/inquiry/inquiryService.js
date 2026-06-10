const prisma = require('../../../config/db');

// ─── Error factory
const handleError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// ─── Shared query 
const inquiryInclude = {
  student: true,
  assignedTo: {
    select: { id: true, fullName: true, email: true }
  }
};


const buildInquiryData = ({ assignedToId, dataReceived, ...rest }) => ({
  ...rest,
  ...(dataReceived  && { dataReceived: new Date(dataReceived) }),
  ...(assignedToId  && { assignedTo: { connect: { id: parseInt(assignedToId, 10) } } })
});


const fetchInquiry = (txOrPrisma, id) =>
  txOrPrisma.inquiry.findUnique({ 
    where: { id }, 
    include: inquiryInclude
  });




const { buildPaginationMeta } = require('../../utils/pagination');

// ─── List all inquiries
const getAllInquiries = async ({ page, limit, skip, search }) => {
  const where = {};
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { student: { fullName: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [inquiries, totalCount] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: inquiryInclude
    }),
    prisma.inquiry.count({ where })
  ]);

  return {
    inquiries,
    pagination: buildPaginationMeta(page, limit, totalCount)
  };
};

// ─── Get specific inquiry by ID
const getInquiryById = async (id) => {
  const inquiry = await fetchInquiry(prisma, parseInt(id, 10));
  if (!inquiry) 
    throw handleError('Inquiry not found', 404); 
  return inquiry;
};

/** Create inquiry
 *   1. Create and link an existing student
 *   2. create a new student inline
 *   3. Create with inquiry only
 */
const createInquiry = async ({ studentId, student, assignedToId, ...inquiryFields }) => {
  const inquiryData = buildInquiryData({ assignedToId, ...inquiryFields });

  if (studentId)         return _createWithExistingStudent(inquiryData, studentId);
  if (student?.fullName) return _createWithNewStudent(inquiryData, student);
  return _createAlone(inquiryData);
};

const _createWithExistingStudent = async (inquiryData, studentId) => {
  const sid = parseInt(studentId, 10);

  const existing = await prisma.student.findUnique({ where: { id: sid } });
  if (!existing) 
    throw handleError(
      'Student not found with the provided studentId', 
      404
    );

  const { id } = await prisma.inquiry.create({ 
    data: { ...inquiryData, student: { connect: { id: sid } } } 
  });
  return fetchInquiry(prisma, id);
};

//Private method 
const _createWithNewStudent = async (inquiryData, student) => {
  const { id } = await prisma.inquiry.create({
    data: {
      ...inquiryData,
      student: {
        create: {
          ...student,
          ...(student.birthDate && { birthDate: new Date(student.birthDate) })
        }
      }
    }
  });
  return fetchInquiry(prisma, id);
};

const _createAlone = async (inquiryData) => {
  const { id } = await prisma.inquiry.create({ data: inquiryData });
  return fetchInquiry(prisma, id);
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
  await prisma.inquiry.delete({ where: { id: inquiryId } });
};


// ─── Assign a student to an inquiry
const assignStudentToInquiry = async (inquiryId, studentId) => {
  const iid = parseInt(inquiryId, 10);
  const sid = parseInt(studentId, 10);

  const inquiry = await prisma.inquiry.findUnique({ where: { id: iid } });
  if (!inquiry) throw handleError('Inquiry not found', 404);

  const student = await prisma.student.findUnique({ where: { id: sid } });
  if (!student) throw handleError('Student not found', 404);

  await prisma.inquiry.update({
    where: { id: iid },
    data: { student: { connect: { id: sid } } }
  });

  return { inquiryId: iid, student };
};

// ─── Unassign a student from an inquiry
const unassignStudentFromInquiry = async (inquiryId, studentId) => {
  const iid = parseInt(inquiryId, 10);
  const sid = parseInt(studentId, 10);

  const inquiry = await prisma.inquiry.findUnique({ where: { id: iid } });
  if (!inquiry) throw handleError('Inquiry not found', 404);
  if (inquiry.studentId !== sid) throw handleError('Student is not linked to this inquiry', 400);

  await prisma.inquiry.update({ where: { id: iid }, data: { student: { disconnect: true } } });
};

// ─── Assign an account to an inquiry
const assignAccountToInquiry = async (inquiryId, accountId) => {
  const iid = parseInt(inquiryId, 10);
  const aid = parseInt(accountId, 10);

  const account = await prisma.account.findUnique({ where: { id: aid } });
  if (!account) throw handleError('Account not found', 404);

  return prisma.inquiry.update({
    where: { id: iid },
    data: { assignedToId: aid, updatedAt: new Date() },
    include: inquiryInclude
  });
};

// ─── Search students (for assignment UI)
const searchStudents = async (query) =>
  prisma.student.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email:    { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 20,
    orderBy: { fullName: 'asc' }
  });

// ─── Search staff accounts (for assignment UI)
const searchAccounts = async (query) =>
  prisma.account.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email:    { contains: query, mode: 'insensitive' } }
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
  searchAccounts
};