import { FormField } from '../ui/FormField'
import { EMPLOYMENT_TYPES } from '../../types/enums'
import { formatEmploymentType, fullName } from '../../utils/format'

export const emptyEmployeeFormValues = () => ({
  employeeCode: '',
  firstName: '',
  lastName: '',
  phone: '',
  departmentId: '',
  designationId: '',
  locationId: '',
  shiftId: '',
  managerId: '',
  employmentType: 'FULL_TIME',
  joiningDate: '',
})

export function employeeToFormValues(employee) {
  return {
    employeeCode: employee.employeeCode,
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone,
    departmentId: employee.departmentId?.toString() ?? '',
    designationId: employee.designationId?.toString() ?? '',
    locationId: employee.locationId?.toString() ?? '',
    shiftId: employee.shiftId?.toString() ?? '',
    managerId: employee.managerId?.toString() ?? '',
    employmentType: employee.employmentType,
    joiningDate: employee.joiningDate,
  }
}

export function EmployeeFormFields({
  values,
  onChange,
  managers,
  fieldErrors = {},
  disabled,
}) {
  const update = (patch) => {
    onChange({ ...values, ...patch })
  }

  return (
    <>
      <div className="panel-section">
        <h2 className="section-title">Personal information</h2>
        <div className="form-grid">
          <FormField
            label="First name"
            htmlFor="firstName"
            required
            error={fieldErrors.firstName}
          >
            <input
              id="firstName"
              className="input"
              value={values.firstName}
              disabled={disabled}
              onChange={(event) => update({ firstName: event.target.value })}
            />
          </FormField>
          <FormField
            label="Last name"
            htmlFor="lastName"
            required
            error={fieldErrors.lastName}
          >
            <input
              id="lastName"
              className="input"
              value={values.lastName}
              disabled={disabled}
              onChange={(event) => update({ lastName: event.target.value })}
            />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="phone"
            required
            error={fieldErrors.phone}
          >
            <input
              id="phone"
              className="input"
              value={values.phone}
              disabled={disabled}
              onChange={(event) => update({ phone: event.target.value })}
            />
          </FormField>
        </div>
      </div>

      <div className="panel-section">
        <h2 className="section-title">Employment information</h2>
        <div className="form-grid">
          <FormField
            label="Employee code"
            htmlFor="employeeCode"
            required
            error={fieldErrors.employeeCode}
          >
            <input
              id="employeeCode"
              className="input"
              value={values.employeeCode}
              disabled={disabled}
              onChange={(event) => update({ employeeCode: event.target.value })}
            />
          </FormField>
          <FormField
            label="Employment type"
            htmlFor="employmentType"
            required
            error={fieldErrors.employmentType}
          >
            <select
              id="employmentType"
              className="select"
              value={values.employmentType}
              disabled={disabled}
              onChange={(event) =>
                update({ employmentType: event.target.value })
              }
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatEmploymentType(type)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Joining date"
            htmlFor="joiningDate"
            required
            error={fieldErrors.joiningDate}
          >
            <input
              id="joiningDate"
              type="date"
              className="input"
              value={values.joiningDate}
              disabled={disabled}
              onChange={(event) => update({ joiningDate: event.target.value })}
            />
          </FormField>
        </div>
      </div>

      <div className="panel-section">
        <h2 className="section-title">Organization</h2>
        <p className="hint" style={{ marginBottom: '1rem' }}>
          Department, designation, location, and shift master-data APIs are not
          available yet. Optional numeric IDs can be entered when known.
        </p>
        <div className="form-grid">
          <FormField
            label="Department ID"
            htmlFor="departmentId"
            hint="Optional"
          >
            <input
              id="departmentId"
              className="input"
              inputMode="numeric"
              value={values.departmentId}
              disabled={disabled}
              onChange={(event) => update({ departmentId: event.target.value })}
            />
          </FormField>
          <FormField
            label="Designation ID"
            htmlFor="designationId"
            hint="Optional"
          >
            <input
              id="designationId"
              className="input"
              inputMode="numeric"
              value={values.designationId}
              disabled={disabled}
              onChange={(event) =>
                update({ designationId: event.target.value })
              }
            />
          </FormField>
          <FormField label="Location ID" htmlFor="locationId" hint="Optional">
            <input
              id="locationId"
              className="input"
              inputMode="numeric"
              value={values.locationId}
              disabled={disabled}
              onChange={(event) => update({ locationId: event.target.value })}
            />
          </FormField>
          <FormField label="Shift ID" htmlFor="shiftId" hint="Optional">
            <input
              id="shiftId"
              className="input"
              inputMode="numeric"
              value={values.shiftId}
              disabled={disabled}
              onChange={(event) => update({ shiftId: event.target.value })}
            />
          </FormField>
          <FormField
            label="Manager"
            htmlFor="managerId"
            hint="Reporting manager (organizational relationship)"
            className="full"
          >
            <select
              id="managerId"
              className="select"
              value={values.managerId}
              disabled={disabled}
              onChange={(event) => update({ managerId: event.target.value })}
            >
              <option value="">No manager</option>
              {managers.map((manager) => (
                <option key={manager.employeeId} value={manager.employeeId}>
                  {manager.employeeCode} —{' '}
                  {fullName(manager.firstName, manager.lastName)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>
    </>
  )
}
