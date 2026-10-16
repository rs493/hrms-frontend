import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoadingBlock } from '../components/ui/StateBlock'

export function ProtectedRoute({ permission, anyOf }) {
  const { isAuthenticated, can, bootstrapping } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return <LoadingBlock label="Checking session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (permission && !can(permission)) {
    return <Navigate to="/forbidden" replace />
  }

  if (anyOf && !anyOf.some((item) => can(item))) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
