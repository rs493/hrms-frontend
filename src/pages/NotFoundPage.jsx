import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'

export function NotFoundPage() {
  return (
    <div>
      <PageHeader
        title="Page not found"
        subtitle="The requested route does not exist."
      />
      <div className="panel">
        <div className="panel-section">
          <Link className="btn btn-primary" to="/">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
