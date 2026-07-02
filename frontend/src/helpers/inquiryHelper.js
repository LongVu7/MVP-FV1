import api from './helper.js'

const prefix = '/inquiries'

export const getAllInquiries = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const response = await api.get(`${prefix}/`, { params: { page, limit, search } })
  return response.data
}

export const getInquiryById = async (id) => {
  const response = await api.get(`${prefix}/${id}`)
  return response.data.data
}

export const createInquiry = async (data) => {
  const response = await api.post(`${prefix}/`, data)
  return response.data
}

export const updateInquiry = async (id, data) => {
  const response = await api.put(`${prefix}/${id}`, data)
  return response.data
}

export const deleteInquiry = async (id) => {
  const response = await api.delete(`${prefix}/${id}`)
  return response.data
}


export const unassignStudent = async (inquiryId, studentId) => {
  const response = await api.delete(`${prefix}/${inquiryId}/assign-student`, { data: { studentId } })
  return response.data
}

export const assignStudent = async (inquiryId, studentId) => {
  const response = await api.put(`${prefix}/${inquiryId}/assign-student`, { studentId })
  return response.data
}

export const searchAccounts = async (query) => {
  const response = await api.get(`${prefix}/search/accounts`, { params: { q: query } })
  return response.data.results
}

export const searchStudents = async (query) => {
  const response = await api.get(`${prefix}/search/students`, { params: { q: query } })
  return response.data.results
}