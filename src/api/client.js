import axios from 'axios'
import { ApiError } from '../types/api'
import { clearStoredAuth, getStoredAccessToken } from '../auth/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onAuthFailure = null

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0
    const payload = error.response?.data

    if (status === 401) {
      clearStoredAuth()
      onAuthFailure?.()
    }

    const message =
      (typeof payload?.message === 'string' && payload.message) ||
      error.message ||
      'Request failed.'
    const errors = Array.isArray(payload?.errors) ? payload.errors : []

    return Promise.reject(new ApiError(status, message, errors))
  },
)
