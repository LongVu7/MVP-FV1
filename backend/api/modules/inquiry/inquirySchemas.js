const { z } = require('zod');
const { createStudentSchema } = require('../student/studentSchemas');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date string'
});

const { 
  DataSource,
  Regional
} = require('@prisma/client');


const inquiryFields = {
  statusInteraction: z.string().max(100).optional(),
  statusGeneral: z.string().max(100).optional(),
  statusDetail: z.string().max(255).optional(),
  dataSource: z.enum(DataSource).optional(),
  regional: z.enum(Regional).optional(),
  
  priority: z.string().max(50).optional(),
  description: z.string().optional(),
  dataReceived: dateString.optional(),
  groupTele: z.string().max(50).optional(),
  assignedToId: z.number().int('assignedToId must be an integer').optional(),
  sourceDataId: z.number().int('sourceDataId must be an integer').optional(),
  studentId: z.number().int('studentId must be an integer').optional(),
  student: createStudentSchema.optional()
};

const createInquirySchema = z.object(inquiryFields).strict();

const updateInquirySchema = z.object({
  statusInteraction: z.string().max(100).nullable().optional(),
  statusGeneral: z.string().max(100).nullable().optional(),
  statusDetail: z.string().max(255).nullable().optional(),
  priority: inquiryFields.priority,
  description: inquiryFields.description,
  dataReceived: dateString.nullable().optional(),
  dataSource: z.enum(DataSource).nullable().optional(),
  regional: z.enum(Regional).nullable().optional(),
  groupTele: z.string().max(50).nullable().optional(),
  assignedToId: z.number().int().nullable().optional(),
  sourceDataId: z.number().int().nullable().optional()
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
// const dataSourceEnum = [
//   'webGame', 'holland', 'roadShowCity', 'roadShowProvince',
//   'acquireCity', 'acquireProvince', 'cityInquiry', 'provinceInquiry',
//   'partnership', 'income', 'openDayInquiry', 'eventInquiry', 'activeContact'
// ];
// const regionalEnum = ['kv1', 'kv2', 'kv3', 'kv4', 'kv5', 'kv6'];

// const inquiryFields = {
//   statusGeneral: z.enum(StatusGeneral, { message: `statusGeneral must be one of: ${StatusGeneral.join(', ')}` }).optional(),
//   statusDetail: z.enum(StatusDetail, { message: `statusDetail must be one of: ${StatusDetail.join(', ')}` }).optional(),
//   leadSource: z.enum(LeadSource, { message: `leadSource must be one of: ${LeadSource.join(', ')}` }).optional(),
//   firstContactSource: z.enum(FirstContactSource, { message: `firstContactSource must be one of: ${FirstContactSource.join(', ')}` }).optional(),
//   priority: z.string().max(50).optional(),
//   description: z.string().optional(),
//   dataReceived: dateString.optional(),
//   dataSource: z.enum(DataSource, { message: `dataSource must be one of: ${DataSource.join(', ')}` }).optional(),
//   regional: z.enum(Regional, { message: `regional must be one of: ${Regional.join(', ')}` }).optional(),
//   groupTele: z.string().max(50).optional(),
//   assignedToId: z.number().int('assignedToId must be an integer').optional(),
//   studentId: z.number().int('studentId must be an integer').optional(),
//   student: createStudentSchema.optional()