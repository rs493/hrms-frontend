import { PageHeader } from '../components/ui/PageHeader'
import { Alert } from '../components/ui/Alert'

export function OrganizationPage() {
  return (
    <div>
      <PageHeader
        title="Organization"
        subtitle="Master data for departments, designations, locations, and shifts."
      />

      <div className="panel">
        <div className="panel-section">
          <Alert variant="info">
            Department, Designation, Location, and Shift APIs are not available
            in the current backend. Employee and onboarding forms accept
            optional numeric IDs until those modules are implemented.
          </Alert>
          <h2 className="section-title">Planned modules</h2>
          <ul>
            <li>Departments</li>
            <li>Designations</li>
            <li>Locations</li>
            <li>Shifts</li>
          </ul>
          <p className="hint">
            This page is a deliberate placeholder so organization navigation can
            be wired without inventing frontend-only mock APIs.
          </p>
        </div>
      </div>
    </div>
  )
}
