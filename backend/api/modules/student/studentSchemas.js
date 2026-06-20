const { z } = require('zod');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date string'
});

const gpaNumber = z.coerce
  .number({ invalid_type_error: 'gpa must be a number' })
  .min(0, 'gpa must be >= 0')
  .max(10, 'gpa must be <= 10')
  .optional();

const mobileString = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string()
    .length(10, 'Mobile number must be exactly 10 digits long')
    .startsWith('0', 'Mobile number must start with 0')
    .regex(/^\d+$/, 'Mobile number must contain only numbers')
    .optional()
);

const createStudentSchema = z.object({
  fullName: z.string().min(1, 'fullName is required').max(255),
  gender: z.string().max(20).optional(),
  email: z.email('email must be a valid email address').max(255).optional(),
  mobile: mobileString,
  otherPhone: mobileString,
  birthDate: dateString.optional(),
  gpa: gpaNumber,
  englishCertificate: z.string().max(255).optional(),
  parentPhone: mobileString,
  primaryAddressCity: z.string().max(255).optional(),
  schoolId: z.number().int().positive('schoolId must be a positive integer').optional()
}).strict();

const updateStudentSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  gender: z.string().max(20).optional(),
  email: z.email('email must be a valid email address').max(255).optional(),
  mobile: mobileString,
  otherPhone: mobileString,
  birthDate: dateString.optional(),
  gpa: gpaNumber.optional(),
  englishCertificate: z.string().max(255).optional(),
  parentPhone: mobileString,
  primaryAddressCity: z.string().max(255).optional(),
  schoolId: z.number().int().positive('schoolId must be a positive integer').optional()
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Request body cannot be empty' }
);

const importStudentSchema = z.object({
  fullName: z.string().min(1, 'fullName is required').max(255),
  gender: z.string().max(20).optional(),
  email: z.preprocess((val) => (val === '' ? undefined : val), z.email('email must be a valid email address').max(255).optional()),
  mobile: mobileString,
  otherPhone: mobileString,
  birthDate: dateString.optional(),
  gpa: gpaNumber.optional(),
  englishCertificate: z.string().max(255).optional(),
  parentPhone: mobileString,
  primaryAddressCity: z.string().max(255).optional(),
  schoolId: z.coerce.number().int().positive('schoolId must be a positive integer').optional()
}).passthrough();

const importStudentsPayloadSchema = z.object({
  students: z.array(importStudentSchema).min(1, 'At least one student must be provided for import')
});

module.exports = { createStudentSchema, updateStudentSchema, importStudentsPayloadSchema };

// const updateStudentSchema = z.object({
//   fullName: z.string().min(1).max(255).optional(),
//   gender: z.string().max(20).optional(),
//   email: z.email('email must be a valid email address').max(255).optional(),
//   mobile: z.string().max(20).optional(),
//   otherPhone: z.string().max(20).optional(),
//   birthDate: dateString.optional(),
//   gpa: z.number({ invalid_type_error: 'gpa must be a number' }).optional(),
//   englishCertificate: z.string().max(255).optional(),
//   parentPhone: z.string().max(20).optional(),
//   primaryAddressCity: z.string().max(255).optional()
// }).strict().refine((data) => Object.keys(data).length > 0, {
//   message: 'Request body cannot be empty'
// });

