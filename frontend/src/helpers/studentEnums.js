// ─── Student enum options & label helpers
// Shared across StudentForm, StudentList, StudentShowDialog, etc.

export const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' }
]

export const classOptions = [
  { label: 'Lớp 11', value: 'GRADE_11' },
  { label: 'Lớp 12', value: 'GRADE_12' },
  { label: 'Thí sinh tự do', value: 'FREELANCE' }
]

export const schoolTypeOptions = [
  { label: 'A*', value: 'A_STAR' },
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' }
]

export const provinceGroupOptions = [
  { label: 'TP HCM', value: 'HO_CHI_MINH' },
  { label: 'Tỉnh ruột', value: 'CORE_PROVINCE' },
  { label: 'Tỉnh ngoài', value: 'OTHER_PROVINCE' },
  { label: 'Nước ngoài', value: 'FOREIGN' }
]

export const priorityOptions = [
  { label: 'I', value: 'I' },
  { label: 'II', value: 'II' },
  { label: 'III', value: 'III' },
  { label: 'IV', value: 'IV' },
  { label: 'V', value: 'V' }
]

export const gpaOptions = [
  { label: '3 môn <21đ', value: 'LOWER_21' },
  { label: '3 môn lớp 11 từ 21-23đ', value: 'G11_21_TO_23' },
  { label: '3 môn HK1 12 từ 21-23đ', value: 'G12_SEM1_21_TO_23' },
  { label: '3 môn cả năm 12 từ 21-23đ', value: 'G12_21_TO_23' },
  { label: '3 môn lớp 11 từ 24-26đ', value: 'G11_24_TO_26' },
  { label: '3 môn HK1 12 từ 24-26đ', value: 'G12_SEM1_24_TO_26' },
  { label: '3 môn cả năm 12 từ 24-26đ', value: 'G12_24_TO_26' },
  { label: '3 môn lớp 11 >26đ', value: 'G11_HIGHER_26' },
  { label: '3 môn HK1 12 >26đ', value: 'G12_SEM1_HIGHER_26' },
  { label: '3 môn cả năm 12 >26đ', value: 'G12_HIGHER_26' },
  { label: 'Khác', value: 'OTHER' }
]

export const programScoreOptions = [
  { label: 'Đạt xét HB Talent', value: 'TALENT_SCHOLARSHIP' },
  { label: 'Đạt xét HB khác', value: 'OTHER_SCHOLARSHIP' },
  { label: 'Đạt - không có HB', value: 'ELIGIBLE_NO_SCHOLARSHIP' },
  { label: 'Đang chờ xét duyệt', value: 'PENDING_REVIEW' },
  { label: 'Chưa đủ điểm đầu vào', value: 'NOT_ELIGIBLE' },
  { label: 'Khác', value: 'OTHER' }
]

export const englishCertOptions = [
  { label: 'IELTS', value: 'IELTS' },
  { label: 'TOEFL', value: 'TOEFL' },
  { label: 'TOEIC', value: 'TOEIC' },
  { label: 'VSTEP', value: 'VSTEP' },
  { label: 'APTIS', value: 'APTIS' },
  { label: 'Linguaskill', value: 'LINGUASKILL' },
  { label: 'PEIC', value: 'PEIC' },
  { label: 'Cambridge Exam', value: 'CAMBRIDGE_EXAM' },
  { label: 'PTE', value: 'PTE' },
  { label: 'Other', value: 'other' }
]

// ─── Label lookup helpers (value → label)
// Build lookup map from option array for O(1) access

function buildLabelMap(options) {
  const map = {}
  for (const opt of options) {
    map[opt.value] = opt.label
  }
  return map
}

const classLabelMap = buildLabelMap(classOptions)
const schoolTypeLabelMap = buildLabelMap(schoolTypeOptions)
const provinceGroupLabelMap = buildLabelMap(provinceGroupOptions)
const gpaLabelMap = buildLabelMap(gpaOptions)
const programScoreLabelMap = buildLabelMap(programScoreOptions)
const englishCertLabelMap = buildLabelMap(englishCertOptions)

export const getClassLabel = (value) => classLabelMap[value] || value || '—'
export const getSchoolTypeLabel = (value) => schoolTypeLabelMap[value] || value || '—'
export const getProvinceGroupLabel = (value) => provinceGroupLabelMap[value] || value || '—'
export const getGpaLabel = (value) => gpaLabelMap[value] || value || '—'
export const getProgramScoreLabel = (value) => programScoreLabelMap[value] || value || '—'
export const getEnglishCertLabel = (value) => englishCertLabelMap[value] || value || '—'
