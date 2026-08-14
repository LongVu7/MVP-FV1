import api from './helper.js'

const prefix = '/permissions'

export const getAllPermissions = async () => {
  const response = await api.get(`${prefix}/`)
  return response.data
}
