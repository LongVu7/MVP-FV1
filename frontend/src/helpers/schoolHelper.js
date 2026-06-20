import api from './helper.js'

const prefix = '/schools'

export const getAllCities = async () => {
  const response = await api.get('/cities/')
  return response.data.data
}

export const getSchoolOptions = async (cityId) => {
  const params = {}
  if (cityId) params.cityId = cityId
  const response = await api.get(`${prefix}/options`, { params })
  return response.data.data
}

export const getAllSchools = async ({ page = 1, limit = 20, search = '', cityId } = {}) => {
  const params = { page, limit }
  if (search) params.search = search
  if (cityId) params.cityId = cityId
  const response = await api.get(`${prefix}/`, { params })
  return response.data
}

export const getSchoolById = async (id) => {
  const response = await api.get(`${prefix}/${id}`)
  return response.data.data
}

export const createSchool = async (data) => {
  const response = await api.post(`${prefix}/`, data)
  return response.data
}

export const updateSchool = async (id, data) => {
  const response = await api.put(`${prefix}/${id}`, data)
  return response.data
}

export const deleteSchool = async (id) => {
  const response = await api.delete(`${prefix}/${id}`)
  return response.data
}

export const getSchoolStatistics = async () => {
  const response = await api.get(`${prefix}/statistics`)
  return response.data.data
}
