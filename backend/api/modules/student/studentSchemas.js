const { z } = require('zod');

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date string'
});



const { EnglishCertificate, GPA, ProgramScore } = require('@prisma/client');

const mobileString = z.preprocess(
  (val) => (val === '' || val === null ? null : val),
  z.string()
    .length(10, 'Mobile number must be exactly 10 digits long')
    .startsWith('0', 'Mobile number must start with 0')
    .regex(/^\d+$/, 'Mobile number must contain only numbers')
    .nullable()
    .optional()
);

const specializedRegisterSchema = z.object({
  interestedMajorId: z.number().int().positive('interestedMajorId must be a positive integer').nullable().optional(),
  specificMajorId: z.number().int().positive('specificMajorId must be a positive integer').nullable().optional(),
  admissionYear: z.preprocess(
    (val) => (val === '' || val === null ? null : (val === undefined ? undefined : Number(val))),
    z.number().int().nullable().optional()
  ),
  englishCertificate: z.enum(EnglishCertificate).nullable().optional(),
  gpa: z.enum(GPA).nullable().optional(),
  programScore: z.enum(ProgramScore).nullable().optional()
}).strict();


const createStudentSchema = z.object({
  fullName: z.string({
    required_error: 'fullName is required',
    invalid_type_error: 'fullName must be a string'
  }).min(1, 'fullName is required').max(255),
  gender: z.string().max(20).nullable().optional(),
  email: z.email('email must be a valid email address').max(255).nullable().optional(),
  mobile: mobileString,
  otherPhone: mobileString,
  birthDate: dateString.nullable().optional(),
  parentPhone: mobileString,
  primaryAddressCity: z.string().max(255).nullable().optional(),
  schoolId: z.number().int().positive('schoolId must be a positive integer'),
  specializedRegister: specializedRegisterSchema.optional()
}).strict();

const updateStudentSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  gender: z.string().max(20).nullable().optional(),
  email: z.email('email must be a valid email address').max(255).nullable().optional(),
  mobile: mobileString,
  otherPhone: mobileString,
  birthDate: dateString.nullable().optional(),
  parentPhone: mobileString,
  primaryAddressCity: z.string().max(255).nullable().optional(),
  schoolId: z.number().int().positive('schoolId must be a positive integer'),
  specializedRegister: specializedRegisterSchema.optional()
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Request body cannot be empty' }
);

const importStudentSchema = z.object({
  fullName: z.string({
    required_error: 'fullName is required',
    invalid_type_error: 'fullName must be a string'
  }).min(1, 'fullName is required').max(255),
  gender: z.string().max(20).optional(),
  email: z.preprocess((val) => (val === '' ? undefined : val), z.email('email must be a valid email address').max(255).optional()),
  mobile: mobileString,
  otherPhone: mobileString,
  birthDate: dateString.optional(),
  parentPhone: mobileString,
  primaryAddressCity: z.string().max(255).optional(),
  schoolId: z.preprocess(
    (val) => (val === '' || val === null ? null : (val === undefined ? undefined : Number(val))),
    z.number().int().positive('schoolId must be a positive integer').nullable().optional()
  ),
  specializedRegister: specializedRegisterSchema.optional()
}).passthrough();

const importStudentsPayloadSchema = z.object({
  students: z.array(importStudentSchema).min(1, 'At least one student must be provided for import')
});

module.exports = { createStudentSchema, updateStudentSchema, importStudentsPayloadSchema };


