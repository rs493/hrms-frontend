import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ permission, anyOf }) {
  const { isAuthenticated, can } = useAuth()
  const location = useLocation()

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
