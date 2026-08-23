const xlsx = require('xlsx');
const { ProvinceGroup, SchoolType, StudentClass, Priority, EnglishCertificate, GPA, ProgramScore } = require('@prisma/client');
const prisma = require('../../../config/db');
const crypto = require('crypto');

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
  'Group Tele': { key: 'groupTele', requiredStruct: true, requiredNew: false }
};

const generateTemplate = () => {
  const headers = Object.keys(COLUMN_MAP);
  const worksheet = xlsx.utils.aoa_to_sheet([headers]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Import Template');
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// --- Helpers ---
const normalizeMobile = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;
  // Basic normalization: if it's 9 digits and starts with non-zero, maybe prepend 0?
  // We'll just enforce 10 digits starting with 0.
  let cleaned = str.replace(/\D/g, '');
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
};

const parseExcelDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    return new Date(Math.round((val - 25569) * 86400 * 1000));
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const resolveHierarchy = (nodes, levelNames, levelsProvided) => {
  // nodes: list of all nodes for a tree (e.g., all StatusData)
  // levelNames: ['interaction', 'general', 'detail']
  // levelsProvided: array of strings corresponding to labels/names provided in excel
  // Returns { resolvedId, error }
  let currentParentId = null;
  let resolvedId = null;

  for (let i = 0; i < levelNames.length; i++) {
    const levelName = levelNames[i];
    const val = levelsProvided[i];

    if (!val) {
      // If subsequent levels are provided without this one, it's an INVALID_RELATION
      for (let j = i + 1; j < levelNames.length; j++) {
        if (levelsProvided[j]) {
          return { error: `Missing parent level: ${levelName} when child level is provided` };
        }
      }
      break; // Valid partial hierarchy end
    }

    // Match node
    const node = nodes.find(n =>
      n.level === levelName &&
      n.parentId === currentParentId &&
      (n.label ? n.label.toLowerCase() === val.toLowerCase() : n.name.toLowerCase() === val.toLowerCase())
    );

    if (!node) {
      return { error: `Unresolved mapping at level ${levelName} for value "${val}" (parentId: ${currentParentId})` };
    }

    resolvedId = node.id;
    currentParentId = node.id;
  }
  return { resolvedId };
};

const previewImportInquiry = async (fileBuffer, accountId) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  if (rawData.length === 0) {
    const error = new Error('The uploaded file is empty');
    error.status = 400;
    throw error;
  }

  // Validate headers
  const fileHeaders = Object.keys(rawData[0] || {});
  for (const [header, config] of Object.entries(COLUMN_MAP)) {
    if (config.requiredStruct && !fileHeaders.includes(header)) {
      const error = new Error(`COLUMN_MISSING: Missing required header "${header}"`);
      error.status = 400;
      throw error;
    }
  }

  // Parse and Normalize
  const parsedRows = rawData.map((row, index) => {
    const r = { _meta: { rowNumber: index + 2, errors: [], warnings: [], raw: row } };
    for (const [header, config] of Object.entries(COLUMN_MAP)) {
      r[config.key] = typeof row[header] === 'string' ? row[header].trim() : row[header];
    }
    r.mobile = normalizeMobile(r.mobile);
    r.birthDate = parseExcelDate(r.birthDate);
    r.dataReceived = parseExcelDate(r.dataReceived);
    return r;
  });

  // Check file duplicates
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

  // Pre-load reference data
  const mobiles = [...new Set(parsedRows.map(r => r.mobile).filter(Boolean))];
  const existingStudents = await prisma.student.findMany({
    where: { mobile: { in: mobiles } },
    include: { inquiry: true }
  });

  const oldProvinces = await prisma.oldProvince.findMany();
  const schools = await prisma.school.findMany();
  const newProvinces = await prisma.newProvince.findMany();
  const countries = await prisma.country.findMany();
  const majorData = await prisma.majorData.findMany({ where: { isActive: true } });
  const statusData = await prisma.statusData.findMany({ where: { isActive: true } });
  const sourceData = await prisma.sourceData.findMany({ where: { isActive: true } });
  const accounts = await prisma.account.findMany({ where: { isActive: true } });

  // Process rows
  for (const row of parsedRows) {
    if (row._meta.classification) continue; // Skip if already classified (DUPLICATE/INVALID)

    const student = existingStudents.find(s => s.mobile === row.mobile);
    const isNew = !student;

    if (!isNew && student.inquiry) {
      row._meta.classification = 'EXISTING_INQUIRY';
      continue;
    }

    // New Student Validation
    if (isNew) {
      // Row Required checks
      for (const [header, config] of Object.entries(COLUMN_MAP)) {
        if (config.requiredNew && (row[config.key] === null || row[config.key] === '' || row[config.key] === undefined)) {
          row._meta.errors.push(`MISSING_REQUIRED_FIELD: ${header} is required for new students`);
        }
      }

      // References
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

      // Enums (basic check and localized mapping)
      const removeVietnameseTones = (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str = str.replace(/đ/g,"d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
      };

      const normalizeEnum = (val) => {
        if (!val) return val;
        let str = String(val).trim();
        str = removeVietnameseTones(str).toUpperCase();
        str = str.replace(/[\s\-*]+/g, '_');
        return str;
      };

      const PROVINCE_MAP = {
        'TP_HCM': 'HO_CHI_MINH',
        'HO_CHI_MINH': 'HO_CHI_MINH',
        'TINH_RUOT': 'CORE_PROVINCE',
        'CORE_PROVINCE': 'CORE_PROVINCE',
        'TINH_NGOAI': 'OTHER_PROVINCE',
        'OTHER_PROVINCE': 'OTHER_PROVINCE',
        'NUOC_NGOAI': 'FOREIGN',
        'FOREIGN': 'FOREIGN'
      };

      const CLASS_MAP = {
        'LOP_11': 'GRADE_11',
        'GRADE_11': 'GRADE_11',
        'LOP_12': 'GRADE_12',
        'GRADE_12': 'GRADE_12',
        'THI_SINH_TU_DO': 'FREELANCE',
        'FREELANCE': 'FREELANCE'
      };

      const GPA_MAP = {
        '3_MON_LT21D': 'LOWER_21', // Note: < becomes LT
        '3_MON_<21D': 'LOWER_21',
        '3_MON_LOP_11_TU_21_23D': 'G11_21_TO_23',
        '3_MON_HK1_12_TU_21_23D': 'G12_SEM1_21_TO_23',
        '3_MON_CA_NAM_12_TU_21_23D': 'G12_21_TO_23',
        '3_MON_LOP_11_TU_24_26D': 'G11_24_TO_26',
        '3_MON_HK1_12_TU_24_26D': 'G12_SEM1_24_TO_26',
        '3_MON_CA_NAM_12_TU_24_26D': 'G12_24_TO_26',
        '3_MON_LOP_11_>26D': 'G11_HIGHER_26',
        '3_MON_HK1_12_>26D': 'G12_SEM1_HIGHER_26',
        '3_MON_CA_NAM_12_>26D': 'G12_HIGHER_26',
        'KHAC': 'OTHER',
        // Support direct enum values
        'LOWER_21': 'LOWER_21',
        'G11_21_TO_23': 'G11_21_TO_23',
        'G12_SEM1_21_TO_23': 'G12_SEM1_21_TO_23',
        'G12_21_TO_23': 'G12_21_TO_23',
        'G11_24_TO_26': 'G11_24_TO_26',
        'G12_SEM1_24_TO_26': 'G12_SEM1_24_TO_26',
        'G12_24_TO_26': 'G12_24_TO_26',
        'G11_HIGHER_26': 'G11_HIGHER_26',
        'G12_SEM1_HIGHER_26': 'G12_SEM1_HIGHER_26',
        'G12_HIGHER_26': 'G12_HIGHER_26',
        'OTHER': 'OTHER'
      };

      const PROGRAM_SCORE_MAP = {
        'DAT_XET_HB_TALENT': 'TALENT_SCHOLARSHIP',
        'DAT_XET_HB_KHAC': 'OTHER_SCHOLARSHIP',
        'DAT_KHONG_CO_HB': 'ELIGIBLE_NO_SCHOLARSHIP',
        'DANG_CHO_XET_DUYET': 'PENDING_REVIEW',
        'CHUA_DU_DIEM_DAU_VAO': 'NOT_ELIGIBLE',
        'KHAC': 'OTHER',
        // Support direct enum values
        'TALENT_SCHOLARSHIP': 'TALENT_SCHOLARSHIP',
        'OTHER_SCHOLARSHIP': 'OTHER_SCHOLARSHIP',
        'ELIGIBLE_NO_SCHOLARSHIP': 'ELIGIBLE_NO_SCHOLARSHIP',
        'PENDING_REVIEW': 'PENDING_REVIEW',
        'NOT_ELIGIBLE': 'NOT_ELIGIBLE',
        'OTHER': 'OTHER'
      };
      
      const ENGLISH_CERT_MAP = {
        'IELTS': 'IELTS',
        'TOEFL': 'TOEFL',
        'TOEIC': 'TOEIC',
        'VSTEP': 'VSTEP',
        'APTIS': 'APTIS',
        'LINGUASKILL': 'LINGUASKILL',
        'PEIC': 'PEIC',
        'CAMBRIDGE_EXAM': 'CAMBRIDGE_EXAM',
        'PTE': 'PTE',
        'OTHER': 'other',
        'KHAC': 'other'
      };

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

      // Major Hierarchy
      if (row.interestedMajor || row.specificMajor) {
        const majorRes = resolveHierarchy(majorData, ['interestedMajor', 'specificMajor'], [row.interestedMajor, row.specificMajor]);
        if (majorRes.error) row._meta.errors.push(`INVALID_RELATION (Major): ${majorRes.error}`);
        else {
          // Manually assign IDs since it could be partial
          const im = majorData.find(m => m.level === 'interestedMajor' && m.name.toLowerCase() === (row.interestedMajor || '').toLowerCase());
          const sm = majorData.find(m => m.level === 'specificMajor' && m.name.toLowerCase() === (row.specificMajor || '').toLowerCase() && m.parentId === im?.id);
          row.interestedMajorId = im?.id;
          row.specificMajorId = sm?.id;
        }
      }
      
      // Academic Intentions cross-validation
      const hasAcademicIntentions = row.interestedMajorId || row.admissionYear || row.englishCertificate || row.gpa || row.programScore;
      if (hasAcademicIntentions) {
        if (!row.gpa) row._meta.errors.push(`GPA is required when Academic Intentions are provided`);
        if (!row.programScore) row._meta.errors.push(`Program Score is required when Academic Intentions are provided`);
        if (!row.interestedMajorId) row._meta.errors.push(`Interested Major is required when Academic Intentions are provided`);
      }
    } else {
      row._meta.warnings.push('Uploaded Student, Education, and Specialized Register data will be ignored as the student already exists.');
    }

    // Common Inquiry Fields Validation
    if (row.assignedTo) {
      const acc = accounts.find(a => a.email.toLowerCase() === row.assignedTo.toLowerCase());
      if (!acc) row._meta.errors.push(`UNRESOLVED_MAPPING: Account Email "${row.assignedTo}"`);
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

    if (row._meta.errors.length > 0) {
      const hasUnresolved = row._meta.errors.some(e => e.includes('UNRESOLVED_MAPPING') || e.includes('INVALID_RELATION'));
      row._meta.classification = hasUnresolved ? 'MAPPING_ISSUE' : 'INVALID';
    } else {
      row._meta.classification = isNew ? 'READY_NEW_STUDENT_AND_INQUIRY' : 'READY_EXISTING_STUDENT_NEW_INQUIRY';
      // Map existing student ID for confirm logic
      if (!isNew) row.existingStudentId = student.id;
    }
  }

  // Create Token
  const importToken = crypto.randomUUID();
  importTokens.set(importToken, {
    accountId,
    data: parsedRows,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000,
    status: 'READY'
  });

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
              priority: row.priority || null,
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
          await tx.inquiry.create({
            data: {
              assignedToId: row.assignedToId,
              description: row.description,
              dataReceived: row.dataReceived,
              groupTele: row.groupTele,
              statusDataId: row.statusDataId,
              sourceDataId: row.sourceDataId,
              studentId: student.id
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

        await prisma.inquiry.create({
          data: {
            assignedToId: row.assignedToId,
            description: row.description,
            dataReceived: row.dataReceived,
            groupTele: row.groupTele,
            statusDataId: row.statusDataId,
            sourceDataId: row.sourceDataId,
            studentId: row.existingStudentId
          }
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
