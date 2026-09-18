// ─── Dashboard and Report Constants

export const majorInterestOptions = [
  { label: 'Quan tâm đúng ngành', value: 'right_major_interest' },
  { label: 'Quan tâm gần ngành', value: 'related_major_interest' },
  { label: 'Quan tâm khác ngành', value: 'different_major_interest' }
]

export const ADVISOR_STATUS_CONFIG = [
  { key: 'paymentCompletedNb', label: 'Đã đóng phí (NB)', color: '#10b981' },
  { key: 'applicationSubmitted', label: 'Đã nộp hồ sơ', color: '#3b82f6' },
  { key: 'considering', label: 'Cân nhắc', color: '#f59e0b' },
  { key: 'interested', label: 'Quan tâm', color: '#6366f1' },
  { key: 'scheduledCallback', label: 'Hẹn gọi lại', color: '#8b5cf6' },
  { key: 'noAnswer', label: 'Không bắt máy', color: '#ef4444' },
  { key: 'unreachable', label: 'Không liên lạc được', color: '#f43f5e' },
  { key: 'notInterested', label: 'Không quan tâm', color: '#9ca3af' },
  { key: 'wrongNumber', label: 'Sai số', color: '#d1d5db' }
]

export const PERFORMANCE_METRIC_COLUMNS = [
  { field: 'totalProcessed', header: 'Tổng data xử lý' },
  { field: 'interacted', header: 'Tương tác được' },
  { field: 'interactionRate', header: '% tương tác được / Tổng data xử lý', isRate: true },
  { field: 'nb', header: 'Đã đóng phí (NB)' },
  { field: 'nbRate', header: 'Tỷ lệ NB / Tương tác được', isRate: true },
  { field: 'notInteracted', header: 'Chưa tương tác được' },
  { field: 'notInteractedRate', header: '% chưa tương tác được / Tổng data xử lý', isRate: true },
  { field: 'wrongNumberRate', header: '% Sai số', isRate: true },
  { field: 'notInterestedRate', header: '% Không quan tâm', isRate: true },
  { field: 'unprocessed', header: 'Chưa xử lý' }
]

export const ADVISOR_RATE_COLUMNS = [
  { field: 'advisorName', header: 'Tư vấn', class: 'font-semibold' },
  { field: 'processed', header: 'Tổng data xử lý' },
  { field: 'interacted', header: 'Tương tác được' },
  { field: 'interactionRate', header: '% Tương tác được', isRate: true },
  { field: 'nb', header: 'Đã đóng phí (NB)' },
  { field: 'nbRate', header: 'Tỷ lệ NB', isRate: true },
  { field: 'notInterestedRate', header: '% Không quan tâm', isRate: true },
  { field: 'wrongNumberRate', header: '% Sai số', isRate: true }
]
