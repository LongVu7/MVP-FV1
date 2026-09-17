// ─── Inquiry enum options & label helpers
// Shared across InquiryForm, InquiryList, InquiryShowDialog, etc.

export const eventOptions = [
  { label: 'Talkshow', value: 'TALKSHOW' },
  { label: 'Livestream', value: 'LIVESTREAM' },
  { label: 'Open Day', value: 'OPEN_DAY' },
  { label: 'Coffee Talk', value: 'COFFEE_TALK' },
  { label: 'Campus Tour', value: 'CAMPUS_TOUR' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Tư vấn 1:1', value: 'ONE_ON_ONE_CONSULTATION' }
]

export const compensationOptions = [
  { label: 'Báo bù sổ', value: 'REPORTED' },
  { label: 'Đã được bù', value: 'COMPENSATED' }
]

// ─── Label lookup helpers

function buildLabelMap(options) {
  const map = {}
  for (const opt of options) {
    map[opt.value] = opt.label
  }
  return map
}

const eventLabelMap = buildLabelMap(eventOptions)
const compensationLabelMap = buildLabelMap(compensationOptions)

export const getEventLabel = (value) => eventLabelMap[value] || value || '—'
export const getCompensationLabel = (value) => compensationLabelMap[value] || value || '—'

/**
 * Format an array of event name enums into a comma-separated label string.
 */
export const formatEventNames = (events) => {
  if (!events || events.length === 0) return '—'
  return events.map(getEventLabel).join(', ')
}

/**
 * Extract a specific status level label from the nested statusData object.
 */
export const getStatusLevel = (statusData, level) => {
  if (!statusData) return '—'
  
  if (level === 'interaction') {
    if (statusData.level === 'interaction') return statusData.label
    if (statusData.level === 'general' && statusData.parent) return statusData.parent.label
    if (statusData.level === 'detail' && statusData.parent?.parent) return statusData.parent.parent.label
  }
  
  if (level === 'general') {
    if (statusData.level === 'general') return statusData.label
    if (statusData.level === 'detail' && statusData.parent) return statusData.parent.label
  }
  
  if (level === 'detail') {
    if (statusData.level === 'detail') return statusData.label
  }
  
  return '—'
}
