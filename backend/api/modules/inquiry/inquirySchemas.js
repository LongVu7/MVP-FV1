const { z } = require('zod');
const { createStudentSchema, optionalMobileString, mobileString, capitalizeName } = require('../student/studentSchemas');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date string'
});

const {
  EventName,
  CompensationStatus,
  Priority
} = require('@prisma/client');


const inquiryFields = {
  statusDataId: z.number().int('statusDataId must be an integer').optional(),
  description: z.string().optional(),
  dataReceived: dateString.optional(),
  groupTele: z.string().max(50).optional(),
  assignedToId: z.number().int('assignedToId must be an integer').optional(),
  sourceDataId: z.number().int('sourceDataId must be an integer').optional(),
  studentId: z.number().int('studentId must be an integer').optional(),
  student: createStudentSchema.optional(),
  createDate: dateString.optional(),
  interactionAt: dateString.optional(),
  callCount: z.number().int().min(1).max(10).optional(),
  eventNames: z.array(z.enum(EventName)).optional(),
  callLog: z.string().max(5000).optional(),
  recordFile: z.string().optional(),
  compensationStatus: z.enum(CompensationStatus).optional(),
  priority: z.enum(Priority).optional()
};

const createInquirySchema = z.object(inquiryFields).strict();

const updateInquirySchema = z.object({
  statusDataId: z.number().int().nullable().optional(),
  description: inquiryFields.description,
  dataReceived: dateString.nullable().optional(),
  groupTele: z.string().max(50).nullable().optional(),
  assignedToId: z.number().int().nullable().optional(),
  sourceDataId: z.number().int().nullable().optional(),
  createDate: dateString.nullable().optional(),
  interactionAt: dateString.nullable().optional(),
  callCount: z.number().int().min(1).max(10).nullable().optional(),
  eventNames: z.array(z.enum(EventName)).nullable().optional(),
  callLog: z.string().max(5000).nullable().optional(),
  recordFile: z.string().nullable().optional(),
  compensationStatus: z.enum(CompensationStatus).nullable().optional(),
  priority: z.enum(Priority).nullable().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Request body cannot be empty'
});

const assignStudentSchema = z.object({
  studentId: z.number().int('studentId must be an integer')
}).strict();

const assignAccountSchema = z.object({
  accountId: z.number().int('accountId must be an integer')
}).strict();

// Schema for raw rows imported from Excel
const importInquirySchema = z.object({
  fullName: z.string().nullable().optional().or(z.literal('')).transform(capitalizeName),
  gender: z.string().nullable().optional().or(z.literal('')),
  email: z.string().email('Invalid email format').nullable().optional().or(z.literal('')),
  mobile: mobileString,
  otherPhone: optionalMobileString,
  parentPhone: optionalMobileString,
  birthDate: z.date().nullable().optional().or(z.literal('')),
  primaryAddress: z.string().nullable().optional().or(z.literal('')),
  priority: z.string().nullable().optional().or(z.literal('')),

  oldProvince: z.string().nullable().optional().or(z.literal('')),
  school: z.string().nullable().optional().or(z.literal('')),
  newProvince: z.string().nullable().optional().or(z.literal('')),
  country: z.string().nullable().optional().or(z.literal('')),
  provinceGroup: z.string().nullable().optional().or(z.literal('')),
  schoolType: z.string().nullable().optional().or(z.literal('')),
  class: z.string().nullable().optional().or(z.literal('')),

  interestedMajor: z.string().nullable().optional().or(z.literal('')),
  specificMajor: z.string().nullable().optional().or(z.literal('')),
  admissionYear: z.union([z.string(), z.number()]).nullable().optional().or(z.literal('')),
  englishCertificate: z.string().nullable().optional().or(z.literal('')),
  gpa: z.string().nullable().optional().or(z.literal('')),
  programScore: z.string().nullable().optional().or(z.literal('')),

  assignedTo: z.string().email('Assigned To must be a valid email').nullable().optional().or(z.literal('')),
  statusInteraction: z.string().nullable().optional().or(z.literal('')),
  statusGeneral: z.string().nullable().optional().or(z.literal('')),
  statusDetail: z.string().nullable().optional().or(z.literal('')),
  source: z.string().nullable().optional().or(z.literal('')),
  sourceDetail: z.string().nullable().optional().or(z.literal('')),
  approachMethod: z.string().nullable().optional().or(z.literal('')),
  description: z.string().nullable().optional().or(z.literal('')),
  dataReceived: z.date().nullable().optional().or(z.literal('')),

  _meta: z.any().optional()
});

module.exports = {
  createInquirySchema,
  updateInquirySchema,
  assignStudentSchema,
  assignAccountSchema,
  importInquirySchema
};

