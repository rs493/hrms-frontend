import { apiClient } from './client'

export async function listRoles() {
  const { data } = await apiClient.get('/api/v1/roles')
  return data
}

export async function getRole(roleId) {
  const { data } = await apiClient.get(`/api/v1/roles/${roleId}`)
  return data
}

export async function getRoleByName(roleName) {
  const { data } = await apiClient.get(`/api/v1/roles/by-name/${roleName}`)
  return data
}

export async function createRole(request) {
  const { data } = await apiClient.post('/api/v1/roles', request)
  return data
}

export async function updateRole(roleId, request) {
  const { data } = await apiClient.put(`/api/v1/roles/${roleId}`, request)
  return data
}

export async function deleteRole(roleId) {
  await apiClient.delete(`/api/v1/roles/${roleId}`)
}

export async function getUserRoles(userId) {
  const { data } = await apiClient.get(`/api/v1/users/${userId}/roles`)
  return data
}

export async function assignRoleToUser(userId, roleName) {
  await apiClient.post(`/api/v1/users/${userId}/roles/${roleName}`)
}

export async function removeRoleFromUser(userId, roleName) {
  await apiClient.delete(`/api/v1/users/${userId}/roles/${roleName}`)
}

export async function updateUserRoles(userId, request) {
  await apiClient.put(`/api/v1/users/${userId}/roles`, request)
}
