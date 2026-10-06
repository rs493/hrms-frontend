import { apiClient } from './client'

export async function listEmployees() {
  const { data } = await apiClient.get('/api/v1/employees')
  return data
}

export async function getEmployee(employeeId) {
  const { data } = await apiClient.get(`/api/v1/employees/${employeeId}`)
  return data
}

export async function createEmployee(request) {
  const { data } = await apiClient.post('/api/v1/employees', request)
  return data
}

export async function updateEmployee(employeeId, request) {
  const { data } = await apiClient.put(
    `/api/v1/employees/${employeeId}`,
    request,
  )
  return data
}

export async function deactivateEmployee(employeeId) {
  await apiClient.patch(`/api/v1/employees/${employeeId}/deactivate`)
}

export async function getEmployeeManager(employeeId) {
  const { data } = await apiClient.get(
    `/api/v1/employees/${employeeId}/manager`,
  )
  return data
}

export async function getEmployeesByManager(managerId) {
  const { data } = await apiClient.get(
    `/api/v1/managers/${managerId}/employees`,
  )
  return data
}
