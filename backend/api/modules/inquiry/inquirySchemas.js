const { z } = require('zod');
const { createStudentSchema } = require('../student/studentSchemas');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date string'
});

const { 
  Regional,
  EventName,
  CompensationStatus
} = require('@prisma/client');


const inquiryFields = {
  statusDataId: z.number().int('statusDataId must be an integer').optional(),
  regional: z.enum(Regional).optional(),
  priority: z.string().max(50).optional(),
  description: z.string().optional(),
  dataReceived: dateString.optional(),
  groupTele: z.string().max(50).optional(),
  assignedToId: z.number().int('assignedToId must be an integer').optional(),
  sourceDataId: z.number().int('sourceDataId must be an integer').optional(),
  studentId: z.number().int('studentId must be an integer').optional(),
  student: createStudentSchema.optional(),
  interactionAt: dateString.optional(),
  callCount: z.number().int().min(1).max(10).optional(),
  eventNames: z.array(z.nativeEnum(EventName)).optional(),
  callLog: z.string().max(5000).optional(),
  recordFile: z.string().optional(),
  compensationStatus: z.nativeEnum(CompensationStatus).optional()
};

const createInquirySchema = z.object(inquiryFields).strict();

const updateInquirySchema = z.object({
  statusDataId: z.number().int().nullable().optional(),
  priority: inquiryFields.priority,
  description: inquiryFields.description,
  dataReceived: dateString.nullable().optional(),
  regional: z.enum(Regional).nullable().optional(),
  groupTele: z.string().max(50).nullable().optional(),
  assignedToId: z.number().int().nullable().optional(),
  sourceDataId: z.number().int().nullable().optional(),
  interactionAt: dateString.nullable().optional(),
  callCount: z.number().int().min(1).max(10).nullable().optional(),
  eventNames: z.array(z.nativeEnum(EventName)).nullable().optional(),
  callLog: z.string().max(5000).nullable().optional(),
  recordFile: z.string().nullable().optional(),
  compensationStatus: z.nativeEnum(CompensationStatus).nullable().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Request body cannot be empty'
});

const assignStudentSchema = z.object({
  studentId: z.number().int('studentId must be an integer')
}).strict();

const assignAccountSchema = z.object({
  accountId: z.number().int('accountId must be an integer')
}).strict();

module.exports = {
  createInquirySchema,
  updateInquirySchema,
  assignStudentSchema,
  assignAccountSchema
};

// const statusGeneralEnum = ['new', 'assigned', 'inProcess', 'converted', 'dead'];
// const statusDetailEnum = ['interested', 'considered', 'contactLater', 'kbm', 'notContacted', 'applied'];
// const leadSourceEnum = ['online', 'direct', 'database', 'referal', 'internal', 'onlineMass', 'resonance', 'other'];
// const firstContactSourceEnum = ['tele', 'walkIn', 'online', 'incomingPhone'];
// const regionalEnum = ['kv1', 'kv2', 'kv3', 'kv4', 'kv5', 'kv6'];

// const inquiryFields = {
//   statusGeneral: z.enum(StatusGeneral, { message: `statusGeneral must be one of: ${StatusGeneral.join(', ')}` }).optional(),
//   statusDetail: z.enum(StatusDetail, { message: `statusDetail must be one of: ${StatusDetail.join(', ')}` }).optional(),
//   leadSource: z.enum(LeadSource, { message: `leadSource must be one of: ${LeadSource.join(', ')}` }).optional(),
//   firstContactSource: z.enum(FirstContactSource, { message: `firstContactSource must be one of: ${FirstContactSource.join(', ')}` }).optional(),
//   priority: z.string().max(50).optional(),
//   description: z.string().optional(),
//   dataReceived: dateString.optional(),
//   regional: z.enum(Regional, { message: `regional must be one of: ${Regional.join(', ')}` }).optional(),
//   groupTele: z.string().max(50).optional(),
//   assignedToId: z.number().int('assignedToId must be an integer').optional(),
//   studentId: z.number().int('studentId must be an integer').optional(),
//   student: createStudentSchema.optional()