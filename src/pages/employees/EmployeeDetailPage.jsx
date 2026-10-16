import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deactivateEmployee,
  getEmployee,
  getEmployeeManager,
} from '../../api/employeeApi'
import { useAuth } from '../../auth/AuthContext'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmployeeStatusBadge } from '../../components/ui/StatusBadge'
import { ErrorState, LoadingBlock } from '../../components/ui/StateBlock'
import { Permissions } from '../../types/permission'
import {
  formatDate,
  formatDateTime,
  formatEmploymentType,
  fullName,
} from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { ApiError } from '../../types/api'

export function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const id = Number(employeeId)
  const { can } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionError, setActionError] = useState(null)

  const employeeQuery = useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id),
    enabled: Number.isFinite(id),
  })

  const managerQuery = useQuery({
    queryKey: ['employees', id, 'manager'],
    queryFn: () => getEmployeeManager(id),
    enabled: Number.isFinite(id) && Boolean(employeeQuery.data?.managerId),
    retry: false,
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateEmployee(id),
    onSuccess: async () => {
      setConfirmOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      await employeeQuery.refetch()
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
      setConfirmOpen(false)
    },
  })

  if (!Number.isFinite(id)) {
    return (
      <ErrorState
        title="Invalid employee"
        description="Employee id is missing or invalid."
      />
    )
  }

  if (employeeQuery.isLoading) {
    return <LoadingBlock label="Loading employee…" />
  }

  if (employeeQuery.isError || !employeeQuery.data) {
    return (
      <ErrorState
        title="Unable to load employee"
        description={getErrorMessage(employeeQuery.error)}
        onRetry={() => employeeQuery.refetch()}
      />
    )
  }

  const employee = employeeQuery.data
  const managerError =
    managerQuery.isError && managerQuery.error instanceof ApiError
      ? managerQuery.error
      : null

  return (
    <div>
      <PageHeader
        title={fullName(employee.firstName, employee.lastName)}
        subtitle={`Employee code ${employee.employeeCode}`}
        actions={
          <>
            <Link className="btn btn-secondary" to="/employees">
              Back to list
            </Link>
            {can(Permissions.EMPLOYEE_UPDATE) ? (
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(`/employees/${employee.employeeId}/edit`)
                }
              >
                Edit
              </Button>
            ) : null}
            {can(Permissions.EMPLOYEE_UPDATE) &&
            employee.status === 'ACTIVE' ? (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Deactivate
              </Button>
            ) : null}
          </>
        }
      />

      {actionError ? <Alert variant="error">{actionError}</Alert> : null}

      <div className="panel">
        <div className="panel-section">
          <h2 className="section-title">Employee information</h2>
          <dl className="meta-list">
            <dt>Status</dt>
            <dd>
              <EmployeeStatusBadge status={employee.status} />
            </dd>
            <dt>Employee ID</dt>
            <dd>{employee.employeeId}</dd>
            <dt>Employee code</dt>
            <dd>{employee.employeeCode}</dd>
            <dt>Phone</dt>
            <dd>{employee.phone}</dd>
            <dt>Employment type</dt>
            <dd>{formatEmploymentType(employee.employmentType)}</dd>
            <dt>Joining date</dt>
            <dd>{formatDate(employee.joiningDate)}</dd>
          </dl>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Organization</h2>
          <dl className="meta-list">
            <dt>Department ID</dt>
            <dd>{employee.departmentId ?? '—'}</dd>
            <dt>Designation ID</dt>
            <dd>{employee.designationId ?? '—'}</dd>
            <dt>Location ID</dt>
            <dd>{employee.locationId ?? '—'}</dd>
            <dt>Shift ID</dt>
            <dd>{employee.shiftId ?? '—'}</dd>
            <dt>Manager</dt>
            <dd>
              {employee.managerId == null
                ? '—'
                : managerQuery.isLoading
                  ? 'Loading…'
                  : managerQuery.data
                    ? `${managerQuery.data.employeeCode} — ${fullName(
                        managerQuery.data.firstName,
                        managerQuery.data.lastName,
                      )}`
                    : managerError?.status === 404
                      ? `Manager #${employee.managerId}`
                      : `Manager #${employee.managerId}`}
            </dd>
          </dl>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Audit</h2>
          <dl className="meta-list">
            <dt>Created</dt>
            <dd>{formatDateTime(employee.createdAt)}</dd>
            <dt>Updated</dt>
            <dd>{formatDateTime(employee.updatedAt)}</dd>
          </dl>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate employee"
        message="Only ACTIVE employees can be deactivated. This does not delete the record."
        confirmLabel="Deactivate"
        loading={deactivateMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deactivateMutation.mutate()}
      />
    </div>
  )
}
