import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEmployee } from '../../api/employeeApi'
import { ErrorState, LoadingBlock } from '../../components/ui/StateBlock'
import { getErrorMessage } from '../../utils/errors'
import { EmployeeEditForm } from './EmployeeEditForm'

export function EmployeeEditPage() {
  const { employeeId } = useParams()
  const id = Number(employeeId)

  const employeeQuery = useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id),
    enabled: Number.isFinite(id),
  })

  if (!Number.isFinite(id)) {
    return (
      <ErrorState
        title="Invalid employee"
        description="Employee id is missing or invalid."
      />
    )
  }

  if (employeeQuery.isLoading) {
    return <LoadingBlock label="Loading employee…" />
  }

  if (employeeQuery.isError || !employeeQuery.data) {
    return (
      <ErrorState
        title="Unable to load employee"
        description={getErrorMessage(employeeQuery.error)}
        onRetry={() => employeeQuery.refetch()}
      />
    )
  }

  return (
    <EmployeeEditForm
      key={employeeQuery.data.employeeId}
      employee={employeeQuery.data}
    />
  )
}
