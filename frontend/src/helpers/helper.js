import axios from 'axios'

// Root API instance for the application
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Ensures cookies (like JWT) are sent with every request
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
