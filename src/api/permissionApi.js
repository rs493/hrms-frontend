import { apiClient } from './client'

export async function listPermissions() {
  const { data } = await apiClient.get('/api/v1/permissions')
  return data
}

export async function getPermission(permissionId) {
  const { data } = await apiClient.get(`/api/v1/permissions/${permissionId}`)
  return data
}

export async function getPermissionByCode(permissionCode) {
  const { data } = await apiClient.get(
    `/api/v1/permissions/code/${encodeURIComponent(permissionCode)}`,
  )
  return data
}

export async function createPermission(request) {
  const { data } = await apiClient.post('/api/v1/permissions', request)
  return data
}

export async function deletePermission(permissionId) {
  await apiClient.delete(`/api/v1/permissions/${permissionId}`)
}

export async function getRolePermissions(roleId) {
  const { data } = await apiClient.get(`/api/v1/roles/${roleId}/permissions`)
  return data
}

export async function assignPermissionToRole(roleId, permissionId) {
  await apiClient.post(`/api/v1/roles/${roleId}/permissions/${permissionId}`)
}

export async function removePermissionFromRole(roleId, permissionId) {
  await apiClient.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`)
}

export async function updateRolePermissions(roleId, request) {
  await apiClient.put(`/api/v1/roles/${roleId}/permissions`, request)
}
