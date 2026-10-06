export function formatEmploymentType(value) {
  switch (value) {
    case 'FULL_TIME':
      return 'Full time'
    case 'PART_TIME':
      return 'Part time'
    case 'CONTRACT':
      return 'Contract'
    case 'INTERN':
      return 'Intern'
    default: {
      const _exhaustive = value
      return _exhaustive
    }
  }
}

export function formatEmployeeStatus(value) {
  switch (value) {
    case 'INVITED':
      return 'Invited'
    case 'ACTIVE':
      return 'Active'
    case 'INACTIVE':
      return 'Inactive'
    case 'RESIGNED':
      return 'Resigned'
    case 'TERMINATED':
      return 'Terminated'
    default: {
      const _exhaustive = value
      return _exhaustive
    }
  }
}

export function formatRoleName(value) {
  return value.replaceAll('_', ' ')
}

export function formatDate(value) {
  if (!value) {
    return '—'
  }
  return value
}

export function fullName(firstName, lastName) {
  return `${firstName} ${lastName}`.trim()
}

export function optionalId(value) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('IDs must be positive integers.')
  }
  return parsed
}
