import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/AuthContext'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { FormField } from '../ui/FormField'
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from '../ui/StateBlock'
import { formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

/**
 * CRUD panel for name-only organization master data (departments / designations).
 */
export function NamedMasterSection({
  title,
  nameLabel,
  placeholder,
  queryKey,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  getId,
  getName,
  nameField,
  permissions,
}) {
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const canView = can(permissions.view)
  const canCreate = can(permissions.create)
  const canUpdate = can(permissions.update)
  const canDelete = can(permissions.delete)

  const listQuery = useQuery({
    queryKey,
    queryFn: listFn,
    enabled: canView,
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey })
  }

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: async () => {
      setName('')
      setSuccess(`${title.slice(0, -1)} created.`)
      setError(null)
      await invalidate()
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }) => updateFn(id, request),
    onSuccess: async () => {
      setEditingId(null)
      setEditName('')
      setSuccess(`${title.slice(0, -1)} updated.`)
      setError(null)
      await invalidate()
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: async () => {
      setPendingDeleteId(null)
      setSuccess(`${title.slice(0, -1)} deleted.`)
      setError(null)
      await invalidate()
    },
    onError: (err) => {
      setPendingDeleteId(null)
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  if (!canView) {
    return null
  }

  const onCreate = (event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError(`${nameLabel} is required.`)
      return
    }
    createMutation.mutate({ [nameField]: trimmed })
  }

  const onSaveEdit = (id) => {
    const trimmed = editName.trim()
    if (!trimmed) {
      setError(`${nameLabel} is required.`)
      return
    }
    updateMutation.mutate({ id, request: { [nameField]: trimmed } })
  }

  const pendingItem =
    pendingDeleteId == null
      ? null
      : (listQuery.data ?? []).find((item) => getId(item) === pendingDeleteId)

  return (
    <div className="panel" style={{ marginBottom: '1.25rem' }}>
      <div className="panel-section">
        <h2 className="section-title">{title}</h2>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        {canCreate ? (
          <form onSubmit={onCreate} style={{ marginBottom: '1.25rem' }}>
            <div className="form-grid">
              <FormField label={nameLabel} htmlFor={`${queryKey[0]}-name`} required>
                <input
                  id={`${queryKey[0]}-name`}
                  className="input"
                  value={name}
                  placeholder={placeholder}
                  disabled={createMutation.isPending}
                  onChange={(event) => setName(event.target.value)}
                />
              </FormField>
            </div>
            <div className="inline-actions" style={{ marginTop: '1rem' }}>
              <Button type="submit" loading={createMutation.isPending}>
                Add {nameLabel.toLowerCase()}
              </Button>
            </div>
          </form>
        ) : null}

        {listQuery.isLoading ? <LoadingBlock /> : null}
        {listQuery.isError ? (
          <ErrorState
            title={`Unable to load ${title.toLowerCase()}`}
            description={getErrorMessage(listQuery.error)}
            onRetry={() => listQuery.refetch()}
          />
        ) : null}
        {listQuery.isSuccess && listQuery.data.length === 0 ? (
          <EmptyState title={`No ${title.toLowerCase()} yet`} />
        ) : null}
        {listQuery.isSuccess && listQuery.data.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{nameLabel}</th>
                  <th>Created</th>
                  <th>Updated</th>
                  {canUpdate || canDelete ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {listQuery.data.map((item) => {
                  const id = getId(item)
                  const isEditing = editingId === id
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>
                        {isEditing ? (
                          <input
                            className="input"
                            value={editName}
                            disabled={updateMutation.isPending}
                            onChange={(event) => setEditName(event.target.value)}
                          />
                        ) : (
                          getName(item)
                        )}
                      </td>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{formatDateTime(item.updatedAt)}</td>
                      {canUpdate || canDelete ? (
                        <td>
                          <div className="inline-actions">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  loading={updateMutation.isPending}
                                  onClick={() => onSaveEdit(id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={updateMutation.isPending}
                                  onClick={() => {
                                    setEditingId(null)
                                    setEditName('')
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                {canUpdate ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingId(id)
                                      setEditName(getName(item))
                                      setError(null)
                                      setSuccess(null)
                                    }}
                                  >
                                    Edit
                                  </Button>
                                ) : null}
                                {canDelete ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setPendingDeleteId(id)}
                                  >
                                    Delete
                                  </Button>
                                ) : null}
                              </>
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={pendingDeleteId != null}
        title={`Delete ${nameLabel.toLowerCase()}`}
        message={
          pendingItem
            ? `Delete "${getName(pendingItem)}" permanently? This may fail if employees still reference it.`
            : 'Delete this item permanently?'
        }
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
