import axios from 'axios'

// Root API instance for the application
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Ensures cookies (like JWT) are sent with every request
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor to attach the Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api
