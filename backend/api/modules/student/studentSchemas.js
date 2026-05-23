const { z } = require('zod');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid ISO 8601 date string'
});

const createStudentSchema = z.object({
  fullName: z.string().min(1, 'fullName is required').max(255),
  gender: z.string().max(20).optional(),
  email: z.string().email('email must be a valid email address').max(255).optional(),
  mobile: z.string().max(20).optional(),
  otherPhone: z.string().max(20).optional(),
  birthDate: dateString.optional(),
  gpa: z.number({ invalid_type_error: 'gpa must be a number' }).optional(),
  englishCertificate: z.string().max(255).optional(),
  parentPhone: z.string().max(20).optional(),
  primaryAddressCity: z.string().max(255).optional()
}).strict();

const updateStudentSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  gender: z.string().max(20).optional(),
  email: z.string().email('email must be a valid email address').max(255).optional(),
  mobile: z.string().max(20).optional(),
  otherPhone: z.string().max(20).optional(),
  birthDate: dateString.optional(),
  gpa: z.number({ invalid_type_error: 'gpa must be a number' }).optional(),
  englishCertificate: z.string().max(255).optional(),
  parentPhone: z.string().max(20).optional(),
  primaryAddressCity: z.string().max(255).optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Request body cannot be empty'
});

module.exports = { createStudentSchema, updateStudentSchema };
