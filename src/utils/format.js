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

/** Calendar date strings (e.g. joiningDate). No timezone conversion. */
export function formatDate(value) {
  if (!value) {
    return '—'
  }
  return value
}

/** Instant / ISO date-time from the API, displayed in IST (Asia/Kolkata). */
export function formatDateTime(timestamp) {
  if (!timestamp) {
    return '—'
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
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
