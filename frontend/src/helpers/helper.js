import axios from 'axios'

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const resolvedBaseUrl = envBaseUrl 
  ? (envBaseUrl.endsWith('/api') ? envBaseUrl : `${envBaseUrl.replace(/\/$/, '')}/api`) 
  : '/api';

// Root API instance for the application
const api = axios.create({
  baseURL: resolvedBaseUrl,
  withCredentials: true, // Ensures cookies (like JWT) are sent with every request
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
