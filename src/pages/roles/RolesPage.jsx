import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRole,
  deleteRole,
  getUserRoles,
  listRoles,
  updateUserRoles,
} from '../../api/roleApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { FormField } from '../../components/ui/FormField'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from '../../components/ui/StateBlock'
import { ALL_ROLE_NAMES } from '../../types/enums'
import { formatDateTime, formatRoleName } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

export function RolesPage() {
  const queryClient = useQueryClient()
  const [roleName, setRoleName] = useState('EMPLOYEE')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
  })

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      setSuccess('Role created.')
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      setPendingDeleteId(null)
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (err) => {
      setPendingDeleteId(null)
      setError(getErrorMessage(err))
    },
  })

  const onCreate = (event) => {
    event.preventDefault()
    createMutation.mutate({ roleName })
  }

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="System roles and user-role assignment. Permission mapping is managed per role."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <form className="panel-section" onSubmit={onCreate}>
          <h2 className="section-title">Create role</h2>
          <div className="form-grid">
            <FormField label="Role name" htmlFor="roleName" required>
              <select
                id="roleName"
                className="select"
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
              >
                {ALL_ROLE_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {formatRoleName(name)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="inline-actions" style={{ marginTop: '1rem' }}>
            <Button type="submit" loading={createMutation.isPending}>
              Create role
            </Button>
          </div>
        </form>
      </div>

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-section">
          <h2 className="section-title">Existing roles</h2>
          {rolesQuery.isLoading ? <LoadingBlock /> : null}
          {rolesQuery.isError ? (
            <ErrorState
              title="Unable to load roles"
              description={getErrorMessage(rolesQuery.error)}
              onRetry={() => rolesQuery.refetch()}
            />
          ) : null}
          {rolesQuery.isSuccess && rolesQuery.data.length === 0 ? (
            <EmptyState title="No roles found" />
          ) : null}
          {rolesQuery.isSuccess && rolesQuery.data.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesQuery.data.map((role) => (
                    <tr key={role.roleId}>
                      <td>{role.roleId}</td>
                      <td>{formatRoleName(role.roleName)}</td>
                      <td>{formatDateTime(role.createdAt)}</td>
                      <td>{formatDateTime(role.updatedAt)}</td>
                      <td>
                        <div className="inline-actions">
                          <Link
                            className="btn btn-ghost btn-sm"
                            to={`/roles/${role.roleId}`}
                          >
                            Permissions
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setPendingDeleteId(role.roleId)}
                          >
                            Delete
                          </Button>
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

      <UserRolesPanel />

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Delete role"
        message="Delete this role permanently? This may fail if the role is still assigned."
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

function UserRolesPanel() {
  const [userIdInput, setUserIdInput] = useState('')
  const [loadedUserId, setLoadedUserId] = useState(null)
  const [draftRoles, setDraftRoles] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const rolesQuery = useQuery({
    queryKey: ['user-roles', loadedUserId],
    queryFn: () => getUserRoles(loadedUserId),
    enabled: loadedUserId != null,
  })

  const selectedRoles = draftRoles ?? rolesQuery.data ?? []

  const updateMutation = useMutation({
    mutationFn: () => updateUserRoles(loadedUserId, { roles: selectedRoles }),
    onSuccess: async () => {
      setMessage('User roles updated.')
      setError(null)
      setDraftRoles(null)
      await rolesQuery.refetch()
    },
    onError: (err) => {
      setMessage(null)
      setError(getErrorMessage(err))
    },
  })

  const loadUser = () => {
    const parsed = Number(userIdInput)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError('Enter a valid positive user ID.')
      return
    }
    setError(null)
    setMessage(null)
    setDraftRoles(null)
    setLoadedUserId(parsed)
  }

  return (
    <div className="panel">
      <div className="panel-section">
        <h2 className="section-title">User role assignment</h2>
        <p className="hint" style={{ marginBottom: '1rem' }}>
          There is no user-list API yet. Enter a known user ID (for example from
          an onboarding response) to view and replace that user&apos;s roles.
        </p>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {message ? <Alert variant="success">{message}</Alert> : null}
        <div className="toolbar">
          <FormField label="User ID" htmlFor="userId">
            <input
              id="userId"
              className="input"
              style={{ maxWidth: 220 }}
              inputMode="numeric"
              value={userIdInput}
              onChange={(event) => setUserIdInput(event.target.value)}
            />
          </FormField>
          <Button type="button" variant="secondary" onClick={loadUser}>
            Load roles
          </Button>
        </div>
        {rolesQuery.isFetching ? (
          <LoadingBlock label="Loading user roles…" />
        ) : null}
        {rolesQuery.isError ? (
          <ErrorState
            title="Unable to load user roles"
            description={getErrorMessage(rolesQuery.error)}
            onRetry={() => rolesQuery.refetch()}
          />
        ) : null}
        {rolesQuery.isSuccess ? (
          <>
            <p style={{ margin: '1rem 0 0.75rem' }}>
              Replace roles for user #{loadedUserId}. Current selection is saved
              as the full set.
            </p>
            <div className="chip-list" style={{ marginBottom: '1rem' }}>
              {ALL_ROLE_NAMES.map((name) => {
                const checked = selectedRoles.includes(name)
                return (
                  <label
                    key={name}
                    className="badge badge-neutral"
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setDraftRoles(
                          checked
                            ? selectedRoles.filter((item) => item !== name)
                            : [...selectedRoles, name],
                        )
                      }}
                      style={{ marginRight: '0.35rem' }}
                    />
                    {formatRoleName(name)}
                  </label>
                )
              })}
            </div>
            <Button
              type="button"
              loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              Save user roles
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
