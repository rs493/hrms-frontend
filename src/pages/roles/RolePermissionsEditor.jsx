import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getRolePermissions,
  listPermissions,
  updateRolePermissions,
} from '../../api/permissionApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ErrorState, LoadingBlock } from '../../components/ui/StateBlock'
import { getErrorMessage } from '../../utils/errors'

export function RolePermissionsEditor({ role }) {
  const queryClient = useQueryClient()
  const [draftIds, setDraftIds] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const rolePermissionsQuery = useQuery({
    queryKey: ['roles', role.roleId, 'permissions'],
    queryFn: () => getRolePermissions(role.roleId),
  })

  const allPermissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: listPermissions,
  })

  const selectedIds =
    draftIds ??
    rolePermissionsQuery.data?.map((permission) => permission.permissionId) ??
    []

  const saveMutation = useMutation({
    mutationFn: () =>
      updateRolePermissions(role.roleId, { permissionIds: selectedIds }),
    onSuccess: async () => {
      setSuccess('Role permissions updated.')
      setError(null)
      setDraftIds(null)
      await queryClient.invalidateQueries({
        queryKey: ['roles', role.roleId, 'permissions'],
      })
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  if (rolePermissionsQuery.isLoading || allPermissionsQuery.isLoading) {
    return <LoadingBlock label="Loading role permissions…" />
  }

  if (rolePermissionsQuery.isError) {
    return (
      <ErrorState
        title="Unable to load role permissions"
        description={getErrorMessage(rolePermissionsQuery.error)}
        onRetry={() => rolePermissionsQuery.refetch()}
      />
    )
  }

  return (
    <>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="panel">
        <div className="panel-section">
          <h2 className="section-title">Assigned permissions</h2>
          <p className="hint" style={{ marginBottom: '1rem' }}>
            Saving replaces the complete permission set for this role.
          </p>
          {allPermissionsQuery.isError ? (
            <ErrorState
              title="Unable to load permissions"
              description={getErrorMessage(allPermissionsQuery.error)}
              onRetry={() => allPermissionsQuery.refetch()}
            />
          ) : null}
          <div className="chip-list" style={{ marginBottom: '1.25rem' }}>
            {(allPermissionsQuery.data ?? []).map((permission) => {
              const checked = selectedIds.includes(permission.permissionId)
              return (
                <label
                  key={permission.permissionId}
                  className="badge badge-neutral"
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setDraftIds(
                        checked
                          ? selectedIds.filter(
                              (item) => item !== permission.permissionId,
                            )
                          : [...selectedIds, permission.permissionId],
                      )
                    }}
                    style={{ marginRight: '0.35rem' }}
                  />
                  {permission.permissionCode}
                </label>
              )
            })}
          </div>
          <Button
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save permissions
          </Button>
        </div>
      </div>
    </>
  )
}
