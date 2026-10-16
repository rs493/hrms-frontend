import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listEmployees, updateEmployee } from '../../api/employeeApi'
import {
  listDepartments,
  listDesignations,
  listOfficeLocations,
} from '../../api/organizationApi'
import {
  EmployeeFormFields,
  employeeToFormValues,
} from '../../components/employees/EmployeeFormFields'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  toEmployeeRequest,
  validateEmployeeForm,
} from '../../hooks/useEmployeeFormSubmit'
import { getErrorMessage } from '../../utils/errors'

export function EmployeeEditForm({ employee }) {
  const id = employee.employeeId
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState(() => employeeToFormValues(employee))
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)

  const managersQuery = useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  })

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
  })

  const designationsQuery = useQuery({
    queryKey: ['designations'],
    queryFn: listDesignations,
  })

  const officeLocationsQuery = useQuery({
    queryKey: ['office-locations'],
    queryFn: listOfficeLocations,
  })

  const mutation = useMutation({
    mutationFn: (request) => updateEmployee(id, request),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      navigate(`/employees/${updated.employeeId}`)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const onSubmit = (event) => {
    event.preventDefault()
    const errors = validateEmployeeForm(values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    setError(null)
    try {
      mutation.mutate(toEmployeeRequest(values))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const managers = (managersQuery.data ?? []).filter(
    (item) => item.employeeId !== id,
  )

  return (
    <div>
      <PageHeader
        title="Edit employee"
        subtitle={`Updating ${employee.employeeCode}`}
        actions={
          <Link className="btn btn-secondary" to={`/employees/${id}`}>
            Cancel
          </Link>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <form className="panel" onSubmit={onSubmit} noValidate>
        <EmployeeFormFields
          values={values}
          onChange={setValues}
          managers={managers}
          departments={departmentsQuery.data ?? []}
          designations={designationsQuery.data ?? []}
          officeLocations={officeLocationsQuery.data ?? []}
          departmentsLoading={departmentsQuery.isLoading}
          designationsLoading={designationsQuery.isLoading}
          officeLocationsLoading={officeLocationsQuery.isLoading}
          departmentsError={
            departmentsQuery.isError
              ? getErrorMessage(
                  departmentsQuery.error,
                  'Could not load departments.',
                )
              : null
          }
          designationsError={
            designationsQuery.isError
              ? getErrorMessage(
                  designationsQuery.error,
                  'Could not load designations.',
                )
              : null
          }
          officeLocationsError={
            officeLocationsQuery.isError
              ? getErrorMessage(
                  officeLocationsQuery.error,
                  'Could not load office locations.',
                )
              : null
          }
          fieldErrors={fieldErrors}
          disabled={mutation.isPending}
        />
        <div className="panel-section">
          <div className="inline-actions">
            <Button type="submit" loading={mutation.isPending}>
              Save changes
            </Button>
            <Link className="btn btn-secondary" to={`/employees/${id}`}>
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
