const xlsx = require('xlsx');
const { ProvinceGroup, SchoolType, StudentClass, Priority, EnglishCertificate, GPA, ProgramScore } = require('@prisma/client');
const prisma = require('../../../config/db');
const crypto = require('crypto');
const {
  normalizeEnum,
  PROVINCE_MAP,
  CLASS_MAP,
  GPA_MAP,
  PROGRAM_SCORE_MAP,
  ENGLISH_CERT_MAP
} = require('../../utils/enumMapper');
const { applyStatusTransition } = require('../../utils/statusTransition');
const { importInquirySchema } = require('./inquirySchemas');

// !!-- Create an idempotent key for import process to prevent duplicate imports --!   Notes: Migrate Redis for cache data
// Map<token, { accountId, data, createdAt, expiresAt, status }>
const importTokens = new Map();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, value] of importTokens.entries()) {
    if (now > value.expiresAt) {
      importTokens.delete(token);
    }
  }
}, 60 * 1000);

// ─── Column Mapping ─────────────────────────────────────────────────────────

const COLUMN_MAP = {
  'Full Name': { key: 'fullName', requiredStruct: true, requiredNew: true },
  'Gender': { key: 'gender', requiredStruct: true, requiredNew: true },
  'Email': { key: 'email', requiredStruct: true, requiredNew: false },
  'Mobile': { key: 'mobile', requiredStruct: true, requiredNew: true },
  'Other Phone': { key: 'otherPhone', requiredStruct: true, requiredNew: false },
  'Birth Date': { key: 'birthDate', requiredStruct: true, requiredNew: false },
  'Parent Phone': { key: 'parentPhone', requiredStruct: true, requiredNew: false },
  'Primary Address': { key: 'primaryAddress', requiredStruct: true, requiredNew: false },
  'Priority': { key: 'priority', requiredStruct: true, requiredNew: false },

  'Old Province': { key: 'oldProvince', requiredStruct: true, requiredNew: true },
  'School': { key: 'school', requiredStruct: true, requiredNew: true },
  'New Province': { key: 'newProvince', requiredStruct: true, requiredNew: true },
  'Country': { key: 'country', requiredStruct: true, requiredNew: true },
  'Province Group': { key: 'provinceGroup', requiredStruct: true, requiredNew: true },
  'School Type': { key: 'schoolType', requiredStruct: true, requiredNew: true },
  'Class': { key: 'class', requiredStruct: true, requiredNew: true },

  'Interested Major': { key: 'interestedMajor', requiredStruct: true, requiredNew: false },
  'Specific Major': { key: 'specificMajor', requiredStruct: true, requiredNew: false },
  'Admission Year': { key: 'admissionYear', requiredStruct: true, requiredNew: false },
  'English Certificate': { key: 'englishCertificate', requiredStruct: true, requiredNew: false },
  'GPA': { key: 'gpa', requiredStruct: true, requiredNew: false },
  'Program Score': { key: 'programScore', requiredStruct: true, requiredNew: false },

  'Assigned To': { key: 'assignedTo', requiredStruct: true, requiredNew: false },
  'Status Interaction': { key: 'statusInteraction', requiredStruct: true, requiredNew: false },
  'Status General': { key: 'statusGeneral', requiredStruct: true, requiredNew: false },
  'Status Detail': { key: 'statusDetail', requiredStruct: true, requiredNew: false },
  'Source': { key: 'source', requiredStruct: true, requiredNew: false },
  'Source Detail': { key: 'sourceDetail', requiredStruct: true, requiredNew: false },
  'Approach Method': { key: 'approachMethod', requiredStruct: true, requiredNew: false },
  'Description': { key: 'description', requiredStruct: true, requiredNew: false },
  'Data Received': { key: 'dataReceived', requiredStruct: true, requiredNew: false },
};

// ─── Template Generator ─────────────────────────────────────────────────────

const generateTemplate = () => {
  const headers = Object.keys(COLUMN_MAP);
  const worksheet = xlsx.utils.aoa_to_sheet([headers]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Import Template');
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// ─── Value Normalization Helpers ─────────────────────────────────────────────

// Normalize mobile: enforce 10 digits starting with 0
const normalizeMobile = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;
  let cleaned = str.replace(/\D/g, '');
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
};

// Parse Excel serial date number or date string into a JS Date
const parseExcelDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    return new Date(Math.round((val - 25569) * 86400 * 1000));
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// Normalize lookup value for matching (case-insensitive, whitespace-normalized, NFKC)
const normalizeLookupValue = (value) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

// ─── Hierarchy Resolution ────────────────────────────────────────────────────

// Find a single hierarchy node by label (primary) or name (fallback)
// Returns { node, matchedBy } on success, or { error } on failure
const findHierarchyNode = (nodes, { level, parentId, inputValue }) => {
  const normalizedInput = normalizeLookupValue(inputValue);

  const candidates = nodes.filter(node =>
    node.level === level &&
    node.parentId === parentId
  );

  // 1. Try exact normalized label match
  const labelMatches = candidates.filter(node =>
    normalizeLookupValue(node.label) === normalizedInput
  );

  if (labelMatches.length === 1) {
    return { node: labelMatches[0], matchedBy: 'label' };
  }
  // If there are multiple matches, return error (ambiguous mapping)
  if (labelMatches.length > 1) {
    return { error: `Ambiguous label mapping for "${inputValue}" at level "${level}"` };
  }

  // 2. Fallback: try exact normalized name match
  const nameMatches = candidates.filter(node =>
    normalizeLookupValue(node.name) === normalizedInput
  );

  if (nameMatches.length === 1) {
    return { node: nameMatches[0], matchedBy: 'name' };
  }
  if (nameMatches.length > 1) {
    return { error: `Ambiguous name mapping for "${inputValue}" at level "${level}"` };
  }

  return { error: `Unresolved mapping at level "${level}" for value "${inputValue}"` };
};

// Walk a parent → child hierarchy
// Returns { resolvedId, resolvedNodes } on success, or { error } on failure
const resolveHierarchy = (nodes, levelNames, levelsProvided) => {
  let currentParentId = null;
  let resolvedId = null;
  let resolvedNodes = [];

  for (let i = 0; i < levelNames.length; i++) {
    const levelName = levelNames[i];
    const val = levelsProvided[i];

    if (!val) {
      // Validate: child cannot be provided without its parent
      for (let j = i + 1; j < levelNames.length; j++) {
        if (levelsProvided[j]) {
          return { error: `Missing parent level: ${levelName} when child level is provided` };
        }
      }
      break; // Valid partial hierarchy end
    }

    const result = findHierarchyNode(nodes, {
      level: levelName,
      parentId: currentParentId,
      inputValue: val
    });

    if (result.error) {
      return { error: result.error };
    }

    resolvedId = result.node.id;
    currentParentId = result.node.id;
    resolvedNodes.push(result.node);
  }
  return { resolvedId, resolvedNodes };
};

// ─── Row Validation Helpers ──────────────────────────────────────────────────

// Validate required fields for new students
const validateRequiredFields = (row) => {
  for (const [header, config] of Object.entries(COLUMN_MAP)) {
    if (config.requiredNew && (row[config.key] === null || row[config.key] === '' || row[config.key] === undefined)) {
      row._meta.errors.push(`MISSING_REQUIRED_FIELD: ${header} is required for new students`);
    }
  }
};

// Resolve geographic references (oldProvince → school, newProvince, country)
const resolveGeographicReferences = (row, { oldProvinces, schools, newProvinces, countries }) => {
  if (row.oldProvince) {
    const op = oldProvinces.find(p => p.name.toLowerCase() === row.oldProvince.toLowerCase());
    if (!op) {
      row._meta.errors.push(`UNRESOLVED_MAPPING: Old Province "${row.oldProvince}"`);
    } else {
      row.oldProvinceId = op.id;
      if (row.school) {
        const sch = schools.find(s => s.name.toLowerCase() === row.school.toLowerCase() && s.oldProvinceId === op.id);
        if (!sch) {
          row._meta.errors.push(`UNRESOLVED_MAPPING: School "${row.school}" not found in province`);
        } else {
          row.schoolId = sch.id;
        }
      }
    }
  }

  if (row.newProvince) {
    const np = newProvinces.find(p => p.name.toLowerCase() === row.newProvince.toLowerCase());
    if (!np) row._meta.errors.push(`UNRESOLVED_MAPPING: New Province "${row.newProvince}"`);
    else row.newProvinceId = np.id;
  }

  if (row.country) {
    const c = countries.find(x => x.name.toLowerCase() === row.country.toLowerCase());
    if (!c) row._meta.errors.push(`UNRESOLVED_MAPPING: Country "${row.country}"`);
    else row.countryId = c.id;
  }
};

// Validate and normalize enum fields (provinceGroup, schoolType, class, priority, gpa, etc.)
const resolveEnumFields = (row) => {
  if (row.provinceGroup) {
    let norm = normalizeEnum(row.provinceGroup);
    row.provinceGroup = PROVINCE_MAP[norm] || norm;
    if (!Object.keys(ProvinceGroup).includes(row.provinceGroup)) {
      row._meta.errors.push(`Invalid Province Group: ${row.provinceGroup}`);
    }
  }

  if (row.schoolType) {
    row.schoolType = normalizeEnum(row.schoolType);
    if (row.schoolType === 'A_') row.schoolType = 'A_STAR'; // Special case for A*
    if (!Object.keys(SchoolType).includes(row.schoolType)) {
      row._meta.errors.push(`Invalid School Type: ${row.schoolType}`);
    }
  }

  if (row.class) {
    let norm = normalizeEnum(row.class);
    row.class = CLASS_MAP[norm] || norm;
    if (!Object.keys(StudentClass).includes(row.class)) {
      row._meta.errors.push(`Invalid Class: ${row.class}`);
    }
  }

  if (row.priority) {
    row.priority = normalizeEnum(row.priority);
    if (!Object.keys(Priority).includes(row.priority)) {
      row._meta.errors.push(`Invalid Priority: ${row.priority}`);
    }
  }

  if (row.gpa) {
    let norm = normalizeEnum(row.gpa);
    // Sometimes `<` and `>` might not be replaced by the regex.
    norm = norm.replace(/</g, '<').replace(/>/g, '>');
    row.gpa = GPA_MAP[norm] || norm;
    if (!Object.keys(GPA).includes(row.gpa)) {
      row._meta.errors.push(`Invalid GPA: ${row.gpa}`);
    }
  } else {
    row.gpa = null;
  }

  if (row.programScore) {
    let norm = normalizeEnum(row.programScore);
    row.programScore = PROGRAM_SCORE_MAP[norm] || norm;
    if (!Object.keys(ProgramScore).includes(row.programScore)) {
      row._meta.errors.push(`Invalid Program Score: ${row.programScore}`);
    }
  } else {
    row.programScore = null;
  }

  if (row.englishCertificate) {
    let norm = normalizeEnum(row.englishCertificate);
    row.englishCertificate = ENGLISH_CERT_MAP[norm] || norm;
    if (!Object.keys(EnglishCertificate).includes(row.englishCertificate)) {
      row._meta.errors.push(`Invalid English Certificate: ${row.englishCertificate}`);
    }
  } else {
    row.englishCertificate = null;
  }
};

// Resolve major hierarchy and academic intentions cross-validation
const resolveMajorAndAcademics = (row, majorData) => {
  if (row.interestedMajor || row.specificMajor) {
    const majorRes = resolveHierarchy(majorData, ['interestedMajor', 'specificMajor'], [row.interestedMajor, row.specificMajor]);
    if (majorRes.error) {
      row._meta.errors.push(`INVALID_RELATION (Major): ${majorRes.error}`);
    } else {
      const im = majorRes.resolvedNodes.find(n => n.level === 'interestedMajor');
      const sm = majorRes.resolvedNodes.find(n => n.level === 'specificMajor');
      row.interestedMajorId = im?.id || null;
      row.specificMajorId = sm?.id || null;
    }
  }

  // Academic intentions cross-validation
  const hasAcademicIntentions = row.interestedMajorId || row.admissionYear || row.englishCertificate || row.gpa || row.programScore;
  if (hasAcademicIntentions) {
    if (!row.gpa) row._meta.errors.push(`GPA is required when Academic Intentions are provided`);
    if (!row.programScore) row._meta.errors.push(`Program Score is required when Academic Intentions are provided`);
    if (!row.interestedMajorId) row._meta.errors.push(`Interested Major is required when Academic Intentions are provided`);
  }
};

// Resolve common inquiry fields (assignedTo, status hierarchy, source hierarchy)
const resolveInquiryFields = (row, { accounts, statusData, sourceData }) => {
  if (row.assignedTo) {
    const acc = accounts.find(a => a.email.toLowerCase() === row.assignedTo.toLowerCase());
    if (!acc) row._meta.errors.push(`UNRESOLVED_MAPPING: Assigned account Email "${row.assignedTo} is invalid"`);
    else row.assignedToId = acc.id;
  }

  if (row.statusInteraction || row.statusGeneral || row.statusDetail) {
    const statRes = resolveHierarchy(statusData, ['interaction', 'general', 'detail'], [row.statusInteraction, row.statusGeneral, row.statusDetail]);
    if (statRes.error) row._meta.errors.push(`INVALID_RELATION (Status): ${statRes.error}`);
    else row.statusDataId = statRes.resolvedId;
  }

  if (row.source || row.sourceDetail || row.approachMethod) {
    const srcRes = resolveHierarchy(sourceData, ['source', 'sourceDetail', 'approachMethod'], [row.source, row.sourceDetail, row.approachMethod]);
    if (srcRes.error) row._meta.errors.push(`INVALID_RELATION (Source): ${srcRes.error}`);
    else row.sourceDataId = srcRes.resolvedId;
  }
};

// ─── Preview Import ──────────────────────────────────────────────────────────

const previewImportInquiry = async (fileBuffer, accountId) => {
  // 1. Parse Excel
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  if (rawData.length === 0) {
    const error = new Error('The uploaded file is empty');
    error.status = 400;
    throw error;
  }

  // 2. Validate required column headers
  const fileHeaders = Object.keys(rawData[0] || {});
  for (const [header, config] of Object.entries(COLUMN_MAP)) {
    if (config.requiredStruct && !fileHeaders.includes(header)) {
      const error = new Error(`COLUMN_MISSING: Missing required header "${header}"`);
      error.status = 400;
      throw error;
    }
  }

  // 3. Parse and normalize rows
  const parsedRows = rawData.map((row, index) => {
    const r = { _meta: { rowNumber: index + 2, errors: [], warnings: [], raw: row } };
    for (const [header, config] of Object.entries(COLUMN_MAP)) {
      r[config.key] = typeof row[header] === 'string' ? row[header].trim() : row[header];
    }
    r.mobile = normalizeMobile(r.mobile);
    r.birthDate = parseExcelDate(r.birthDate);
    r.dataReceived = parseExcelDate(r.dataReceived);

    const validationResult = importInquirySchema.safeParse(r);
    if (!validationResult.success) {
      validationResult.error.issues.forEach(err => {
        r._meta.errors.push(`FORMAT_ERROR: ${err.path.join('.')}: ${err.message}`);
      });
      r._meta.classification = 'INVALID';
    } else {
      Object.assign(r, validationResult.data);
    }

    return r;
  });

  // 4. Check for in-file duplicate mobiles
  const mobileMap = new Map();
  for (const row of parsedRows) {
    if (row.mobile) {
      if (mobileMap.has(row.mobile)) {
        row._meta.classification = 'DUPLICATE_IN_FILE';
        row._meta.errors.push(`Mobile ${row.mobile} is duplicated in row ${mobileMap.get(row.mobile)}`);
      } else {
        mobileMap.set(row.mobile, row._meta.rowNumber);
      }
    } else {
      row._meta.errors.push('Mobile is required for every row');
      row._meta.classification = 'INVALID';
    }
  }

  // 5. Pre-load reference data (parallelized)
  const mobiles = [...new Set(parsedRows.map(r => r.mobile).filter(Boolean))];
  const [existingStudents, oldProvinces, schools, newProvinces, countries, majorData, statusData, sourceData, accounts] = await Promise.all([
    prisma.student.findMany({ where: { mobile: { in: mobiles } }, include: { inquiry: true } }),
    prisma.oldProvince.findMany(),
    prisma.school.findMany(),
    prisma.newProvince.findMany(),
    prisma.country.findMany(),
    prisma.majorData.findMany({ where: { isActive: true } }),
    prisma.statusData.findMany({ where: { isActive: true } }),
    prisma.sourceData.findMany({ where: { isActive: true } }),
    prisma.account.findMany({ where: { isActive: true } }),
  ]);

  const refData = { oldProvinces, schools, newProvinces, countries, accounts, statusData, sourceData };

  // 6. Validate and resolve each row
  for (const row of parsedRows) {
    if (row._meta.classification) continue; // Skip if already classified (DUPLICATE/INVALID)

    const student = existingStudents.find(s => s.mobile === row.mobile);
    const isNew = !student;

    if (!isNew && student.inquiry) {
      row._meta.classification = 'EXISTING_INQUIRY';
      continue;
    }

    // ── New student: validate all fields ──
    if (isNew) {
      validateRequiredFields(row);
      resolveGeographicReferences(row, refData);
      resolveEnumFields(row);
      resolveMajorAndAcademics(row, majorData);
    } else {
      row._meta.warnings.push('Uploaded Student, Education, and Specialized Register data will be ignored as the student already exists.');
    }

    // ── Common inquiry fields (both new and existing students) ──
    resolveInquiryFields(row, refData);

    // ── Classify row ──
    if (row._meta.errors.length > 0) {
      const hasUnresolved = row._meta.errors.some(e => e.includes('UNRESOLVED_MAPPING') || e.includes('INVALID_RELATION'));
      row._meta.classification = hasUnresolved ? 'MAPPING_ISSUE' : 'INVALID';
    } else {
      row._meta.classification = isNew ? 'READY_NEW_STUDENT_AND_INQUIRY' : 'READY_EXISTING_STUDENT_NEW_INQUIRY';
      if (!isNew) row.existingStudentId = student.id;
    }
  }

  // 7. Create import token
  const importToken = crypto.randomUUID();
  importTokens.set(importToken, {
    accountId,
    data: parsedRows,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000,
    status: 'READY'
  });

  // 8. Build summary
  const summary = {
    total: parsedRows.length,
    readyNew: parsedRows.filter(r => r._meta.classification === 'READY_NEW_STUDENT_AND_INQUIRY').length,
    readyExisting: parsedRows.filter(r => r._meta.classification === 'READY_EXISTING_STUDENT_NEW_INQUIRY').length,
    existingInquiry: parsedRows.filter(r => r._meta.classification === 'EXISTING_INQUIRY').length,
    duplicateInFile: parsedRows.filter(r => r._meta.classification === 'DUPLICATE_IN_FILE').length,
    mappingIssue: parsedRows.filter(r => r._meta.classification === 'MAPPING_ISSUE').length,
    invalid: parsedRows.filter(r => r._meta.classification === 'INVALID').length,
  };

  return { importToken, summary, rows: parsedRows };
};

// ─── Confirm Import ──────────────────────────────────────────────────────────

const confirmImportInquiry = async (importToken, accountId) => {
  const tokenData = importTokens.get(importToken);

  if (!tokenData) {
    const err = new Error('Import token is invalid or has expired');
    err.status = 400;
    throw err;
  }

  if (tokenData.accountId !== accountId) {
    const err = new Error('Unauthorized token');
    err.status = 403;
    throw err;
  }

  if (tokenData.status !== 'READY') {
    const err = new Error('Import is already processing or completed');
    err.status = 400;
    throw err;
  }

  tokenData.status = 'PROCESSING';

  const rows = tokenData.data;
  let newStudentsCreated = 0;
  let newInquiriesForExisting = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row._meta.classification === 'READY_NEW_STUDENT_AND_INQUIRY') {
      try {
        await prisma.$transaction(async (tx) => {
          let srId = null;
          // 1. Create SR conditionally
          if (row.interestedMajorId || row.admissionYear || row.englishCertificate || row.gpa || row.programScore) {
            const sr = await tx.specializedRegister.create({
              data: {
                interestedMajorId: row.interestedMajorId,
                specificMajorId: row.specificMajorId,
                admissionYear: row.admissionYear ? Number(row.admissionYear) : null,
                englishCertificate: row.englishCertificate,
                gpa: row.gpa,
                programScore: row.programScore
              }
            });
            srId = sr.id;
          }

          // 2. Create Student
          const student = await tx.student.create({
            data: {
              fullName: row.fullName,
              gender: row.gender,
              email: row.email || null,
              mobile: row.mobile,
              otherPhone: row.otherPhone || null,
              birthDate: row.birthDate || null,
              parentPhone: row.parentPhone || null,
              primaryAddress: row.primaryAddress || null,
              specializedRegisterId: srId
            }
          });

          // 3. Create Education
          await tx.studentEducation.create({
            data: {
              studentId: student.id,
              schoolId: row.schoolId,
              newProvinceId: row.newProvinceId,
              countryId: row.countryId,
              provinceGroup: row.provinceGroup,
              schoolType: row.schoolType,
              class: row.class
            }
          });

          // 4. Create Inquiry
          let milestoneUpdates = {};
          if (row.statusDataId) {
            milestoneUpdates = await applyStatusTransition({ tx, inquiry: {}, newStatusDataId: row.statusDataId });
          }
          await tx.inquiry.create({
            data: {
              assignedToId: row.assignedToId,
              description: row.description,
              dataReceived: row.dataReceived,
              groupTele: row.groupTele,
              priority: row.priority || null,
              statusDataId: row.statusDataId,
              sourceDataId: row.sourceDataId,
              studentId: student.id,
              ...milestoneUpdates
            }
          });
        });
        newStudentsCreated++;
      } catch (err) {
        console.error(`Row ${row._meta.rowNumber} failed:`, err);
        skipped++; // e.g. unique constraint violation occurred before transaction started
      }
    }
    else if (row._meta.classification === 'READY_EXISTING_STUDENT_NEW_INQUIRY') {
      try {
        // Re-check Inquiry existence just in case
        const student = await prisma.student.findUnique({
          where: { id: row.existingStudentId },
          include: { inquiry: true }
        });

        if (!student || student.inquiry) {
          skipped++;
          continue;
        }

        await prisma.$transaction(async (tx) => {
          let milestoneUpdates = {};
          if (row.statusDataId) {
            milestoneUpdates = await applyStatusTransition({ tx, inquiry: {}, newStatusDataId: row.statusDataId });
          }
          await tx.inquiry.create({
            data: {
              assignedToId: row.assignedToId,
              description: row.description,
              dataReceived: row.dataReceived,
              groupTele: row.groupTele,
              statusDataId: row.statusDataId,
              sourceDataId: row.sourceDataId,
              studentId: row.existingStudentId,
              ...milestoneUpdates
            }
          });
        });
        newInquiriesForExisting++;
      } catch (err) {
        console.error(`Row ${row._meta.rowNumber} failed:`, err);
        skipped++;
      }
    }
    else {
      skipped++;
    }
  }

  // Cleanup token
  importTokens.delete(importToken);

  return {
    newStudentsCreated,
    newInquiriesForExisting,
    skipped
  };
};

module.exports = {
  generateTemplate,
  previewImportInquiry,
  confirmImportInquiry
};
