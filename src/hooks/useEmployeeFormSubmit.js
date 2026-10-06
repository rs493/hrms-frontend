import { optionalId } from '../utils/format'

export function toEmployeeRequest(values) {
  return {
    employeeCode: values.employeeCode.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    departmentId: optionalId(values.departmentId),
    designationId: optionalId(values.designationId),
    locationId: optionalId(values.locationId),
    shiftId: optionalId(values.shiftId),
    managerId: optionalId(values.managerId),
    employmentType: values.employmentType,
    joiningDate: values.joiningDate,
  }
}

export function validateEmployeeForm(values) {
  const errors = {}
  if (!values.employeeCode.trim())
    errors.employeeCode = 'Employee code is required.'
  if (!values.firstName.trim()) errors.firstName = 'First name is required.'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!values.phone.trim()) errors.phone = 'Phone is required.'
  if (!values.employmentType)
    errors.employmentType = 'Employment type is required.'
  if (!values.joiningDate) errors.joiningDate = 'Joining date is required.'

  for (const [key, label] of [
    ['departmentId', 'Department ID'],
    ['designationId', 'Designation ID'],
    ['locationId', 'Location ID'],
    ['shiftId', 'Shift ID'],
    ['managerId', 'Manager'],
  ]) {
    const raw = values[key].trim()
    if (raw && (!Number.isInteger(Number(raw)) || Number(raw) <= 0)) {
      errors[key] = `${label} must be a positive integer.`
    }
  }

  return errors
}
