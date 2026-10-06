import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRole } from '../../api/roleApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, LoadingBlock } from '../../components/ui/StateBlock'
import { formatRoleName } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { RolePermissionsEditor } from './RolePermissionsEditor'

export function RoleDetailPage() {
  const { roleId } = useParams()
  const id = Number(roleId)

  const roleQuery = useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRole(id),
    enabled: Number.isFinite(id),
  })

  if (!Number.isFinite(id)) {
    return (
      <ErrorState
        title="Invalid role"
        description="Role id is missing or invalid."
      />
    )
  }

  if (roleQuery.isLoading) {
    return <LoadingBlock label="Loading role…" />
  }

  if (roleQuery.isError || !roleQuery.data) {
    return (
      <ErrorState
        title="Unable to load role"
        description={getErrorMessage(roleQuery.error)}
        onRetry={() => roleQuery.refetch()}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={`${formatRoleName(roleQuery.data.roleName)} permissions`}
        subtitle={`Role ID ${roleQuery.data.roleId}`}
        actions={
          <Link className="btn btn-secondary" to="/roles">
            Back to roles
          </Link>
        }
      />
      <RolePermissionsEditor
        key={roleQuery.data.roleId}
        role={roleQuery.data}
      />
    </div>
  )
}
