import { ref } from 'vue'
import * as api from '@/helpers/studentHelper'

export function useStudent() {
  const students = ref([])
  const student = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchStudents = async () => {
    loading.value = true
    error.value = null
    try {
      students.value = await api.getAllStudents()
    } catch (err) {
      error.value = err.response?.data?.details || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStudentById = async (id) => {
    loading.value = true
    error.value = null
    try {
      student.value = await api.getStudentById(id)
      return student.value
    } catch (err) {
      error.value = err.response?.data?.details || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createStudent = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.createStudent(payload)
      return response
    } catch (err) {
      error.value = err.response?.data?.details || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStudent = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.updateStudent(id, payload)
      return response
    } catch (err) {
      error.value = err.response?.data?.details || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStudent = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.deleteStudent(id)
      return response
    } catch (err) {
      error.value = err.response?.data?.details || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    students,
    student,
    loading,
    error,
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent
  }
}
