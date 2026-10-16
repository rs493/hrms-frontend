import { apiClient, ensureCsrfToken } from './client'

export async function fetchCsrfToken() {
  return ensureCsrfToken()
}

export async function login(request) {
  await ensureCsrfToken()
  const { data } = await apiClient.post('/api/v1/auth/login', request)
  return data
}

export async function logout() {
  await ensureCsrfToken()
  await apiClient.post('/api/v1/auth/logout')
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/api/v1/auth/me')
  return data
}
