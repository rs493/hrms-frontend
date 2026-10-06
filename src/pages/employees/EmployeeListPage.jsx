import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listEmployees } from '../../api/employeeApi'
import { useAuth } from '../../auth/AuthContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmployeeStatusBadge } from '../../components/ui/StatusBadge'
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from '../../components/ui/StateBlock'
import { Button } from '../../components/ui/Button'
import { EMPLOYEE_STATUSES } from '../../types/enums'
import { Permissions } from '../../types/permission'
import {
  formatEmployeeStatus,
  formatEmploymentType,
  fullName,
} from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

export function EmployeeListPage() {
  const { can } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const query = useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  })

  const filtered = useMemo(() => {
    const employees = query.data ?? []
    const term = search.trim().toLowerCase()
    return employees.filter((employee) => {
      if (statusFilter && employee.status !== statusFilter) {
        return false
      }
      if (!term) {
        return true
      }
      const haystack = [
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.phone,
        employee.employmentType,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [query.data, search, statusFilter])

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Employee records managed separately from user accounts."
        actions={
          can(Permissions.EMPLOYEE_CREATE) ? (
            <Link className="btn btn-primary" to="/employees/new">
              Create employee
            </Link>
          ) : null
        }
      />

      <div className="toolbar">
        <input
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Search code, name, phone…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search employees"
        />
        <select
          className="select"
          style={{ maxWidth: 200 }}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {EMPLOYEE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatEmployeeStatus(status)}
            </option>
          ))}
        </select>
        <div className="spacer" />
        <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
          Refresh
        </Button>
      </div>

      <div className="panel">
        {query.isLoading ? <LoadingBlock label="Loading employees…" /> : null}
        {query.isError ? (
          <ErrorState
            title="Unable to load employees"
            description={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : null}
        {query.isSuccess && filtered.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              search || statusFilter
                ? 'Try adjusting search or status filters.'
                : 'Create an employee record or onboard a user to get started.'
            }
            actionLabel={
              can(Permissions.EMPLOYEE_CREATE) ? 'Create employee' : undefined
            }
            onAction={
              can(Permissions.EMPLOYEE_CREATE)
                ? () => navigate('/employees/new')
                : undefined
            }
          />
        ) : null}
        {query.isSuccess && filtered.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Manager ID</th>
                  <th>Joining date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td>{employee.employeeCode}</td>
                    <td>{fullName(employee.firstName, employee.lastName)}</td>
                    <td>{employee.phone}</td>
                    <td>{formatEmploymentType(employee.employmentType)}</td>
                    <td>
                      <EmployeeStatusBadge status={employee.status} />
                    </td>
                    <td>{employee.managerId ?? '—'}</td>
                    <td>{employee.joiningDate}</td>
                    <td>
                      <div className="inline-actions">
                        <Link
                          className="btn btn-ghost btn-sm"
                          to={`/employees/${employee.employeeId}`}
                        >
                          View
                        </Link>
                        {can(Permissions.EMPLOYEE_UPDATE) ? (
                          <Link
                            className="btn btn-ghost btn-sm"
                            to={`/employees/${employee.employeeId}/edit`}
                          >
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
