import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listEmployees } from '../api/employeeApi'
import { onboard, resendInvite } from '../api/onboardingApi'
import {
  listDepartments,
  listDesignations,
  listOfficeLocations,
} from '../api/organizationApi'
import { useAuth } from '../auth/AuthContext'
import { onboardingPermissionForRole } from '../auth/permissions'
import {
  emptyEmployeeFormValues,
  EmployeeFormFields,
} from '../components/employees/EmployeeFormFields'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import {
  EmployeeStatusBadge,
  UserStatusBadge,
} from '../components/ui/StatusBadge'
import {
  toEmployeeRequest,
  validateEmployeeForm,
} from '../hooks/useEmployeeFormSubmit'
import { ONBOARDABLE_ROLES } from '../types/enums'
import { formatRoleName } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export function OnboardingPage() {
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const [values, setValues] = useState(emptyEmployeeFormValues)
  const [email, setEmail] = useState('')
  const [roleSelection, setRoleSelection] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const availableRoles = useMemo(
    () =>
      ONBOARDABLE_ROLES.filter((candidate) => {
        const permission = onboardingPermissionForRole(candidate)
        return permission ? can(permission) : false
      }),
    [can],
  )

  const role =
    roleSelection && availableRoles.includes(roleSelection)
      ? roleSelection
      : (availableRoles[0] ?? '')

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
    mutationFn: onboard,
    onSuccess: async (response) => {
      setResult(response)
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      setValues(emptyEmployeeFormValues())
      setEmail('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const resendMutation = useMutation({
    mutationFn: (userId) => resendInvite(userId),
    onSuccess: async (response) => {
      setResult(response)
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const onSubmit = (event) => {
    event.preventDefault()
    const errors = validateEmployeeForm(values)
    if (!email.trim()) errors.email = 'Email is required.'
    if (!role) errors.role = 'Role is required.'
    if (role === 'SUPER_ADMIN') {
      errors.role = 'SUPER_ADMIN cannot be created through onboarding.'
    }
    if (role) {
      const permission = onboardingPermissionForRole(role)
      if (!permission || !can(permission)) {
        errors.role = 'You do not have permission to onboard this role.'
      }
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0 || !role) {
      return
    }

    setError(null)
    setResult(null)
    try {
      const employeePayload = toEmployeeRequest(values)
      mutation.mutate({
        ...employeePayload,
        email: email.trim(),
        role,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (availableRoles.length === 0) {
    return (
      <div>
        <PageHeader
          title="Onboarding"
          subtitle="Invite a user with an employee record and role."
        />
        <Alert variant="error">
          You do not have any onboarding create permissions (ADMIN_CREATE,
          HR_CREATE, MANAGER_CREATE, or EMPLOYEE_CREATE).
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Onboarding"
        subtitle="Creates an INVITED employee, INVITED user, assigns a role, and sends activation email."
      />

      {result ? (
        <Alert variant="success" role="status">
          Onboarded {result.email} ({result.employeeCode}). Employee{' '}
          <EmployeeStatusBadge status={result.employeeStatus} /> · User{' '}
          <UserStatusBadge status={result.userStatus} /> · Role{' '}
          {formatRoleName(result.role)}.{' '}
          <Link to={`/employees/${result.employeeId}`}>View employee</Link>
          {result.userStatus === 'INVITED' && result.userId ? (
            <>
              {' '}
              <Button
                type="button"
                variant="secondary"
                loading={resendMutation.isPending}
                disabled={mutation.isPending}
                onClick={() => resendMutation.mutate(result.userId)}
              >
                Resend invite
              </Button>
            </>
          ) : null}
        </Alert>
      ) : null}

      {error ? <Alert variant="error">{error}</Alert> : null}

      <form className="panel" onSubmit={onSubmit} noValidate>
        <EmployeeFormFields
          values={values}
          onChange={setValues}
          managers={managersQuery.data ?? []}
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
          <h2 className="section-title">Account</h2>
          <div className="form-grid">
            <FormField
              label="Email"
              htmlFor="email"
              required
              error={fieldErrors.email}
            >
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                disabled={mutation.isPending}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            <FormField
              label="Role"
              htmlFor="role"
              required
              error={fieldErrors.role}
              hint="SUPER_ADMIN is not available through onboarding."
            >
              <select
                id="role"
                className="select"
                value={role}
                disabled={mutation.isPending}
                onChange={(event) => setRoleSelection(event.target.value)}
              >
                {availableRoles.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {formatRoleName(candidate)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <div className="panel-section">
          <div className="inline-actions">
            <Button type="submit" loading={mutation.isPending}>
              Start onboarding
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
