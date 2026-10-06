import { apiClient } from './client'

export async function login(request) {
  const { data } = await apiClient.post('/api/v1/auth/login', request)
  return data
}
