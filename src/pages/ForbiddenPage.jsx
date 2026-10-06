import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'

export function ForbiddenPage() {
  return (
    <div>
      <PageHeader
        title="Access denied"
        subtitle="You do not have permission to view this page."
      />
      <div className="panel">
        <div className="panel-section">
          <p style={{ marginBottom: '1rem' }}>
            Frontend navigation is permission-aware, but the backend remains the
            security boundary.
          </p>
          <Link className="btn btn-primary" to="/">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
