import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPermission,
  deletePermission,
  listPermissions,
} from '../api/permissionApi'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from '../components/ui/StateBlock'
import { formatDateTime } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export function PermissionsPage() {
  const queryClient = useQueryClient()
  const [permissionCode, setPermissionCode] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: listPermissions,
  })

  const createMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: async () => {
      setPermissionCode('')
      setSuccess('Permission created.')
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: async () => {
      setPendingDeleteId(null)
      await queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
    onError: (err) => {
      setPendingDeleteId(null)
      setError(getErrorMessage(err))
    },
  })

  const onCreate = (event) => {
    event.preventDefault()
    if (!permissionCode.trim()) {
      setError('Permission code is required.')
      return
    }
    createMutation.mutate({ permissionCode: permissionCode.trim() })
  }

  return (
    <div>
      <PageHeader
        title="Permissions"
        subtitle="Permission catalog used by role assignments and API authorization."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <form className="panel-section" onSubmit={onCreate}>
          <h2 className="section-title">Create permission</h2>
          <div className="form-grid">
            <FormField
              label="Permission code"
              htmlFor="permissionCode"
              required
              hint="Example: EMPLOYEE_VIEW"
            >
              <input
                id="permissionCode"
                className="input"
                value={permissionCode}
                onChange={(event) => setPermissionCode(event.target.value)}
              />
            </FormField>
          </div>
          <div className="inline-actions" style={{ marginTop: '1rem' }}>
            <Button type="submit" loading={createMutation.isPending}>
              Create permission
            </Button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-section">
          <h2 className="section-title">Permission catalog</h2>
          {permissionsQuery.isLoading ? <LoadingBlock /> : null}
          {permissionsQuery.isError ? (
            <ErrorState
              title="Unable to load permissions"
              description={getErrorMessage(permissionsQuery.error)}
              onRetry={() => permissionsQuery.refetch()}
            />
          ) : null}
          {permissionsQuery.isSuccess && permissionsQuery.data.length === 0 ? (
            <EmptyState title="No permissions found" />
          ) : null}
          {permissionsQuery.isSuccess && permissionsQuery.data.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionsQuery.data.map((permission) => (
                    <tr key={permission.permissionId}>
                      <td>{permission.permissionId}</td>
                      <td>{permission.permissionCode}</td>
                      <td>{formatDateTime(permission.createdAt)}</td>
                      <td>{formatDateTime(permission.updatedAt)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setPendingDeleteId(permission.permissionId)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Delete permission"
        message="Delete this permission? Roles that still reference it may reject the delete."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId != null) {
            deleteMutation.mutate(pendingDeleteId)
          }
        }}
      />
    </div>
  )
}
