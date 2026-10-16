import { apiClient } from './client'

export async function listDepartments() {
  const { data } = await apiClient.get('/api/v1/departments')
  return data
}

export async function createDepartment(request) {
  const { data } = await apiClient.post('/api/v1/departments', request)
  return data
}

export async function updateDepartment(departmentId, request) {
  const { data } = await apiClient.put(
    `/api/v1/departments/${departmentId}`,
    request,
  )
  return data
}

export async function deleteDepartment(departmentId) {
  await apiClient.delete(`/api/v1/departments/${departmentId}`)
}

export async function listDesignations() {
  const { data } = await apiClient.get('/api/v1/designations')
  return data
}

export async function createDesignation(request) {
  const { data } = await apiClient.post('/api/v1/designations', request)
  return data
}

export async function updateDesignation(designationId, request) {
  const { data } = await apiClient.put(
    `/api/v1/designations/${designationId}`,
    request,
  )
  return data
}

export async function deleteDesignation(designationId) {
  await apiClient.delete(`/api/v1/designations/${designationId}`)
}

export async function listOfficeLocations() {
  const { data } = await apiClient.get('/api/v1/office-locations')
  return data
}

export async function createOfficeLocation(request) {
  const { data } = await apiClient.post('/api/v1/office-locations', request)
  return data
}

export async function updateOfficeLocation(locationId, request) {
  const { data } = await apiClient.put(
    `/api/v1/office-locations/${locationId}`,
    request,
  )
  return data
}

export async function deleteOfficeLocation(locationId) {
  await apiClient.delete(`/api/v1/office-locations/${locationId}`)
}
