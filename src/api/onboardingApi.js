import { apiClient } from './client'

export async function onboard(request) {
  const { data } = await apiClient.post('/api/v1/onboarding', request)
  return data
}

export async function resendInvite(userId) {
  const { data } = await apiClient.post(
    `/api/v1/onboarding/users/${userId}/resend`,
  )
  return data
}

export async function activateAccount(request) {
  const { data } = await apiClient.post('/api/v1/onboarding/activate', request)
  return data
}
