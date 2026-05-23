const { z } = require('zod');
const { createStudentSchema } = require('../student/studentSchemas');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid ISO 8601 date string'
});

const statusGeneralEnum = ['new', 'assigned', 'inProcess', 'converted', 'dead'];
const statusDetailEnum = ['interested', 'considered', 'contactLater', 'kbm', 'notContacted', 'applied'];
const leadSourceEnum = ['online', 'direct', 'database', 'referal', 'internal', 'onlineMass', 'resonance', 'other'];
const firstContactSourceEnum = ['tele', 'walkIn', 'online', 'incomingPhone'];
const dataSourceEnum = [
  'webGame', 'holland', 'roadShowCity', 'roadShowProvince',
  'acquireCity', 'acquireProvince', 'cityInquiry', 'provinceInquiry',
  'partnership', 'income', 'openDayInquiry', 'eventInquiry', 'activeContact'
];
const regionalEnum = ['kv1', 'kv2', 'kv3', 'kv4', 'kv5', 'kv6'];

const inquiryFields = {
  statusGeneral: z.enum(statusGeneralEnum, { message: `statusGeneral must be one of: ${statusGeneralEnum.join(', ')}` }).optional(),
  statusDetail: z.enum(statusDetailEnum, { message: `statusDetail must be one of: ${statusDetailEnum.join(', ')}` }).optional(),
  leadSource: z.enum(leadSourceEnum, { message: `leadSource must be one of: ${leadSourceEnum.join(', ')}` }).optional(),
  firstContactSource: z.enum(firstContactSourceEnum, { message: `firstContactSource must be one of: ${firstContactSourceEnum.join(', ')}` }).optional(),
  priority: z.string().max(50).optional(),
  description: z.string().optional(),
  dataReceived: dateString.optional(),
  dataSource: z.enum(dataSourceEnum, { message: `dataSource must be one of: ${dataSourceEnum.join(', ')}` }).optional(),
  regional: z.enum(regionalEnum, { message: `regional must be one of: ${regionalEnum.join(', ')}` }).optional(),
  groupTele: z.string().max(50).optional(),
  assignedToId: z.number().int('assignedToId must be an integer').optional(),
  studentId: z.number().int('studentId must be an integer').optional(),
  student: createStudentSchema.optional()
};

const createInquirySchema = z.object(inquiryFields).strict();

const updateInquirySchema = z.object({
  statusGeneral: inquiryFields.statusGeneral,
  statusDetail: inquiryFields.statusDetail,
  leadSource: inquiryFields.leadSource,
  firstContactSource: inquiryFields.firstContactSource,
  priority: inquiryFields.priority,
  description: inquiryFields.description,
  dataReceived: inquiryFields.dataReceived,
  dataSource: inquiryFields.dataSource,
  regional: inquiryFields.regional,
  groupTele: inquiryFields.groupTele,
  assignedToId: inquiryFields.assignedToId
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Request body cannot be empty'
});

const assignStudentSchema = z.object({
  studentId: z.number().int('studentId must be an integer')
}).strict();

const assignStaffSchema = z.object({
  staffId: z.number().int('staffId must be an integer')
}).strict();

module.exports = {
  createInquirySchema,
  updateInquirySchema,
  assignStudentSchema,
  assignStaffSchema
};
