import axios from 'axios'

// Root API instance for the application
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Ensures cookies (like JWT) are sent with every request
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
