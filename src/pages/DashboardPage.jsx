import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listEmployees } from '../api/employeeApi'
import { useAuth } from '../auth/AuthContext'
import { canOnboardAnyRole } from '../auth/permissions'
import { PageHeader } from '../components/ui/PageHeader'
import { EmployeeStatusBadge } from '../components/ui/StatusBadge'
import { ErrorState, LoadingBlock } from '../components/ui/StateBlock'
import { Permissions } from '../types/permission'
import { formatRoleName, fullName } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export function DashboardPage() {
  const { user, can } = useAuth()
  const canViewEmployees = can(Permissions.EMPLOYEE_VIEW)
  const canManageRoles = can(Permissions.ROLE_MANAGE)
  const canOnboard = canOnboardAnyRole(user?.permissions)

  const employeesQuery = useQuery({
    queryKey: ['employees', 'dashboard'],
    queryFn: listEmployees,
    enabled: canViewEmployees,
  })

  const recentEmployees = (employeesQuery.data ?? []).slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Operational overview based on modules available to your account."
      />

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-section">
          <h2 className="section-title">Signed-in user</h2>
          <dl className="meta-list">
            <dt>Email</dt>
            <dd>{user?.email}</dd>
            <dt>User ID</dt>
            <dd>{user?.userId}</dd>
            <dt>Roles</dt>
            <dd>{user?.roles.map(formatRoleName).join(', ') || '—'}</dd>
            <dt>Permissions</dt>
            <dd>
              <div className="chip-list">
                {(user?.permissions ?? []).map((permission) => (
                  <span key={permission} className="badge badge-neutral">
                    {permission}
                  </span>
                ))}
              </div>
            </dd>
          </dl>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-section">
          <h2 className="section-title">Available actions</h2>
          <div className="inline-actions">
            {canViewEmployees ? (
              <Link className="btn btn-secondary" to="/employees">
                View employees
              </Link>
            ) : null}
            {can(Permissions.EMPLOYEE_CREATE) ? (
              <Link className="btn btn-secondary" to="/employees/new">
                Create employee
              </Link>
            ) : null}
            {canOnboard ? (
              <Link className="btn btn-primary" to="/onboarding">
                Onboard user
              </Link>
            ) : null}
            {canManageRoles ? (
              <>
                <Link className="btn btn-secondary" to="/roles">
                  Manage roles
                </Link>
                <Link className="btn btn-secondary" to="/permissions">
                  Manage permissions
                </Link>
              </>
            ) : null}
            {!canViewEmployees && !canOnboard && !canManageRoles ? (
              <p className="hint">
                No administrative modules are available for this account.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {canViewEmployees ? (
        <div className="panel">
          <div className="panel-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Recent employees
              </h2>
              <Link to="/employees">View all</Link>
            </div>

            {employeesQuery.isLoading ? (
              <LoadingBlock label="Loading employees…" />
            ) : null}
            {employeesQuery.isError ? (
              <ErrorState
                title="Unable to load employees"
                description={getErrorMessage(employeesQuery.error)}
                onRetry={() => employeesQuery.refetch()}
              />
            ) : null}
            {employeesQuery.isSuccess && recentEmployees.length === 0 ? (
              <p className="hint">No employees found.</p>
            ) : null}
            {employeesQuery.isSuccess && recentEmployees.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmployees.map((employee) => (
                      <tr key={employee.employeeId}>
                        <td>
                          <Link to={`/employees/${employee.employeeId}`}>
                            {employee.employeeCode}
                          </Link>
                        </td>
                        <td>
                          {fullName(employee.firstName, employee.lastName)}
                        </td>
                        <td>
                          <EmployeeStatusBadge status={employee.status} />
                        </td>
                        <td>{employee.employmentType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
