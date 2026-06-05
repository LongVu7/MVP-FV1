import api from './helper.js'

const prefix = '/inquiries'

export const getAllInquiries = async () => {
  const response = await api.get(`${prefix}/`)
  return response.data.inquiries
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

export const searchStudents = async (query) => {
  const response = await api.get(`${prefix}/search/students`, { params: { q: query } })
  return response.data.results
}

export const unassignStudent = async (inquiryId, studentId) => {
  const response = await api.delete(`${prefix}/${inquiryId}/assign-student`, { data: { studentId } })
  return response.data
}

export const searchStaff = async (query) => {
  const response = await api.get(`${prefix}/search/staff`, { params: { q: query } })
  return response.data.results
}
