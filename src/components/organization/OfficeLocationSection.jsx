import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/AuthContext'
import {
  createOfficeLocation,
  deleteOfficeLocation,
  listOfficeLocations,
  updateOfficeLocation,
} from '../../api/organizationApi'
import { Permissions } from '../../types/permission'
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

export function OfficeLocationSection() {
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const canView = can(Permissions.LOCATION_VIEW)
  const canCreate = can(Permissions.LOCATION_CREATE)
  const canUpdate = can(Permissions.LOCATION_UPDATE)
  const canDelete = can(Permissions.LOCATION_DELETE)

  const listQuery = useQuery({
    queryKey: ['office-locations'],
    queryFn: listOfficeLocations,
    enabled: canView,
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['office-locations'] })
  }

  const createMutation = useMutation({
    mutationFn: createOfficeLocation,
    onSuccess: async () => {
      setLocationName('')
      setAddress('')
      setSuccess('Office location created.')
      setError(null)
      await invalidate()
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }) => updateOfficeLocation(id, request),
    onSuccess: async () => {
      setEditingId(null)
      setEditName('')
      setEditAddress('')
      setSuccess('Office location updated.')
      setError(null)
      await invalidate()
    },
    onError: (err) => {
      setSuccess(null)
      setError(getErrorMessage(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOfficeLocation,
    onSuccess: async () => {
      setPendingDeleteId(null)
      setSuccess('Office location deleted.')
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
    const trimmedName = locationName.trim()
    const trimmedAddress = address.trim()
    if (!trimmedName) {
      setError('Location name is required.')
      return
    }
    if (!trimmedAddress) {
      setError('Address is required.')
      return
    }
    createMutation.mutate({
      locationName: trimmedName,
      address: trimmedAddress,
    })
  }

  const onSaveEdit = (id) => {
    const trimmedName = editName.trim()
    const trimmedAddress = editAddress.trim()
    if (!trimmedName) {
      setError('Location name is required.')
      return
    }
    if (!trimmedAddress) {
      setError('Address is required.')
      return
    }
    updateMutation.mutate({
      id,
      request: {
        locationName: trimmedName,
        address: trimmedAddress,
      },
    })
  }

  const pendingItem =
    pendingDeleteId == null
      ? null
      : (listQuery.data ?? []).find(
          (item) => item.locationId === pendingDeleteId,
        )

  return (
    <div className="panel" style={{ marginBottom: '1.25rem' }}>
      <div className="panel-section">
        <h2 className="section-title">Office locations</h2>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        {canCreate ? (
          <form onSubmit={onCreate} style={{ marginBottom: '1.25rem' }}>
            <div className="form-grid">
              <FormField label="Location name" htmlFor="locationName" required>
                <input
                  id="locationName"
                  className="input"
                  value={locationName}
                  placeholder="e.g. Bengaluru"
                  disabled={createMutation.isPending}
                  onChange={(event) => setLocationName(event.target.value)}
                />
              </FormField>
              <FormField
                label="Address"
                htmlFor="locationAddress"
                required
                className="full"
              >
                <input
                  id="locationAddress"
                  className="input"
                  value={address}
                  placeholder="Street, city, region"
                  disabled={createMutation.isPending}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </FormField>
            </div>
            <div className="inline-actions" style={{ marginTop: '1rem' }}>
              <Button type="submit" loading={createMutation.isPending}>
                Add office location
              </Button>
            </div>
          </form>
        ) : null}

        {listQuery.isLoading ? <LoadingBlock /> : null}
        {listQuery.isError ? (
          <ErrorState
            title="Unable to load office locations"
            description={getErrorMessage(listQuery.error)}
            onRetry={() => listQuery.refetch()}
          />
        ) : null}
        {listQuery.isSuccess && listQuery.data.length === 0 ? (
          <EmptyState title="No office locations yet" />
        ) : null}
        {listQuery.isSuccess && listQuery.data.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Created</th>
                  <th>Updated</th>
                  {canUpdate || canDelete ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {listQuery.data.map((item) => {
                  const isEditing = editingId === item.locationId
                  return (
                    <tr key={item.locationId}>
                      <td>{item.locationId}</td>
                      <td>
                        {isEditing ? (
                          <input
                            className="input"
                            value={editName}
                            disabled={updateMutation.isPending}
                            onChange={(event) => setEditName(event.target.value)}
                          />
                        ) : (
                          item.locationName
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            className="input"
                            value={editAddress}
                            disabled={updateMutation.isPending}
                            onChange={(event) =>
                              setEditAddress(event.target.value)
                            }
                          />
                        ) : (
                          item.address
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
                                  onClick={() => onSaveEdit(item.locationId)}
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
                                    setEditAddress('')
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
                                      setEditingId(item.locationId)
                                      setEditName(item.locationName)
                                      setEditAddress(item.address ?? '')
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
                                    onClick={() =>
                                      setPendingDeleteId(item.locationId)
                                    }
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
        title="Delete office location"
        message={
          pendingItem
            ? `Delete "${pendingItem.locationName}" permanently? This may fail if employees still reference it.`
            : 'Delete this office location permanently?'
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
