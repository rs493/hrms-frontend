import {
  createDepartment,
  createDesignation,
  deleteDepartment,
  deleteDesignation,
  listDepartments,
  listDesignations,
  updateDepartment,
  updateDesignation,
} from '../api/organizationApi'
import { useAuth } from '../auth/AuthContext'
import { NamedMasterSection } from '../components/organization/NamedMasterSection'
import { OfficeLocationSection } from '../components/organization/OfficeLocationSection'
import { Alert } from '../components/ui/Alert'
import { PageHeader } from '../components/ui/PageHeader'
import { Permissions } from '../types/permission'

export function OrganizationPage() {
  const { can } = useAuth()

  const canViewAny =
    can(Permissions.DEPARTMENT_VIEW) ||
    can(Permissions.DESIGNATION_VIEW) ||
    can(Permissions.LOCATION_VIEW)

  return (
    <div>
      <PageHeader
        title="Organization"
        subtitle="Manage departments, designations, and office locations."
      />

      {!canViewAny ? (
        <Alert variant="error">
          You do not have permission to view organization master data
          (DEPARTMENT_VIEW, DESIGNATION_VIEW, or LOCATION_VIEW).
        </Alert>
      ) : null}

      <NamedMasterSection
        title="Departments"
        nameLabel="Department name"
        placeholder="e.g. Engineering"
        queryKey={['departments']}
        listFn={listDepartments}
        createFn={createDepartment}
        updateFn={updateDepartment}
        deleteFn={deleteDepartment}
        getId={(item) => item.departmentId}
        getName={(item) => item.departmentName}
        nameField="departmentName"
        permissions={{
          view: Permissions.DEPARTMENT_VIEW,
          create: Permissions.DEPARTMENT_CREATE,
          update: Permissions.DEPARTMENT_UPDATE,
          delete: Permissions.DEPARTMENT_DELETE,
        }}
      />

      <NamedMasterSection
        title="Designations"
        nameLabel="Designation name"
        placeholder="e.g. Software Developer"
        queryKey={['designations']}
        listFn={listDesignations}
        createFn={createDesignation}
        updateFn={updateDesignation}
        deleteFn={deleteDesignation}
        getId={(item) => item.designationId}
        getName={(item) => item.designationName}
        nameField="designationName"
        permissions={{
          view: Permissions.DESIGNATION_VIEW,
          create: Permissions.DESIGNATION_CREATE,
          update: Permissions.DESIGNATION_UPDATE,
          delete: Permissions.DESIGNATION_DELETE,
        }}
      />

      <OfficeLocationSection />

      <div className="panel">
        <div className="panel-section">
          <h2 className="section-title">Shifts</h2>
          <p className="hint">
            Shift master data belongs to the Attendance / Timesheets module and
            is not managed here yet. Employee forms still accept an optional
            numeric Shift ID.
          </p>
        </div>
      </div>
    </div>
  )
}
