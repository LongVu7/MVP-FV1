import axios from 'axios'

// Base Axios instance for student API calls
const api = axios.create({
  baseURL: '/api/students',
  headers: {
    'Content-Type': 'application/json',
    // Phase 1: role-based auth via header (no JWT yet)
    role: 'admin'
  }
})

export const getAllStudents = async () => {
  const response = await api.get('/')
  return response.data.students
}

export const getStudentById = async (id) => {
  const response = await api.get(`/${id}`)
  return response.data.data
}

export const createStudent = async (studentData) => {
  const response = await api.post('/', studentData)
  return response.data
}

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/${id}`, studentData)
  return response.data
}

export const deleteStudent = async (id) => {
  const response = await api.delete(`/${id}`)
  return response.data
}

export const importStudents = async (files, confirm = false) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('confirm', confirm.toString())

  const response = await api.post('/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      role: 'admin'
    }
  })
  return response.data
}
