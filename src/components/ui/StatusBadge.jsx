import { formatEmployeeStatus } from '../../utils/format'

export function EmployeeStatusBadge({ status }) {
  const variant =
    status === 'ACTIVE'
      ? 'success'
      : status === 'INVITED'
        ? 'warning'
        : status === 'INACTIVE' ||
            status === 'RESIGNED' ||
            status === 'TERMINATED'
          ? 'danger'
          : 'neutral'

  return (
    <span className={`badge badge-${variant}`}>
      {formatEmployeeStatus(status)}
    </span>
  )
}

export function UserStatusBadge({ status }) {
  const variant =
    status === 'ACTIVE'
      ? 'success'
      : status === 'INVITED'
        ? 'warning'
        : 'danger'
  return <span className={`badge badge-${variant}`}>{status}</span>
}
