import axios from 'axios'
import { ApiError } from '../types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let csrfToken = null
let csrfHeaderName = 'X-XSRF-TOKEN'
let csrfPromise = null

let onAuthFailure = null

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler
}

export function clearAuthClientState() {
  csrfToken = null
  csrfPromise = null
}

function isStateChangingMethod(method) {
  const normalized = String(method ?? 'get').toUpperCase()
  return !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(normalized)
}

export async function ensureCsrfToken() {
  if (csrfToken) {
    return csrfToken
  }
  if (!csrfPromise) {
    csrfPromise = apiClient
      .get('/api/v1/auth/csrf')
      .then((response) => {
        csrfToken = response.data?.token ?? null
        if (typeof response.data?.headerName === 'string' && response.data.headerName) {
          csrfHeaderName = response.data.headerName
        }
        return csrfToken
      })
      .finally(() => {
        csrfPromise = null
      })
  }
  return csrfPromise
}

apiClient.interceptors.request.use(async (config) => {
  if (isStateChangingMethod(config.method)) {
    const url = String(config.url ?? '')
    const isCsrfBootstrap = url.includes('/api/v1/auth/csrf')
    if (!isCsrfBootstrap) {
      const token = await ensureCsrfToken()
      if (token) {
        config.headers[csrfHeaderName] = token
      }
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status ?? 0
    const payload = error.response?.data
    const requestUrl = String(error.config?.url ?? '')
    const method = String(error.config?.method ?? 'get').toUpperCase()

    const isAuthBootstrap =
      requestUrl.includes('/api/v1/auth/me') ||
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/csrf')

    // Refresh CSRF once on 403 for mutating requests (stale/missing token).
    if (
      status === 403 &&
      isStateChangingMethod(method) &&
      !error.config?.__csrfRetried &&
      !requestUrl.includes('/api/v1/auth/csrf')
    ) {
      clearAuthClientState()
      try {
        const token = await ensureCsrfToken()
        const headers = {
          ...(error.config.headers ?? {}),
        }
        if (token) {
          headers[csrfHeaderName] = token
        }
        return apiClient.request({
          ...error.config,
          headers,
          __csrfRetried: true,
        })
      } catch {
        // fall through to reject
      }
    }

    if (status === 401 && !isAuthBootstrap) {
      clearAuthClientState()
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
