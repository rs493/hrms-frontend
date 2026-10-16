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
  departments = [],
  designations = [],
  officeLocations = [],
  departmentsLoading = false,
  designationsLoading = false,
  officeLocationsLoading = false,
  departmentsError = null,
  designationsError = null,
  officeLocationsError = null,
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
          Department, designation, and office location are optional. Shift still
          uses a numeric ID until the Attendance module provides shift master
          data.
        </p>
        <div className="form-grid">
          <FormField
            label="Department"
            htmlFor="departmentId"
            hint={
              departmentsError
                ? departmentsError
                : departmentsLoading
                  ? 'Loading departments…'
                  : 'Optional'
            }
            error={fieldErrors.departmentId}
          >
            <select
              id="departmentId"
              className="select"
              value={values.departmentId}
              disabled={disabled || departmentsLoading}
              onChange={(event) => update({ departmentId: event.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option
                  key={department.departmentId}
                  value={department.departmentId}
                >
                  {department.departmentName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Designation"
            htmlFor="designationId"
            hint={
              designationsError
                ? designationsError
                : designationsLoading
                  ? 'Loading designations…'
                  : 'Optional'
            }
            error={fieldErrors.designationId}
          >
            <select
              id="designationId"
              className="select"
              value={values.designationId}
              disabled={disabled || designationsLoading}
              onChange={(event) =>
                update({ designationId: event.target.value })
              }
            >
              <option value="">Select Designation</option>
              {designations.map((designation) => (
                <option
                  key={designation.designationId}
                  value={designation.designationId}
                >
                  {designation.designationName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Office Location"
            htmlFor="locationId"
            hint={
              officeLocationsError
                ? officeLocationsError
                : officeLocationsLoading
                  ? 'Loading office locations…'
                  : 'Optional'
            }
            error={fieldErrors.locationId}
          >
            <select
              id="locationId"
              className="select"
              value={values.locationId}
              disabled={disabled || officeLocationsLoading}
              onChange={(event) => update({ locationId: event.target.value })}
            >
              <option value="">Select Office Location</option>
              {officeLocations.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {location.locationName}
                </option>
              ))}
            </select>
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
