import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { canOnboardAnyRole, Permissions } from '../auth/permissions'
import { useAuth } from '../auth/AuthContext'
import { AppLayout } from '../layouts/AppLayout'
import { ActivatePage } from '../pages/ActivatePage'
import { DashboardPage } from '../pages/DashboardPage'
import { EmployeeCreatePage } from '../pages/employees/EmployeeCreatePage'
import { EmployeeDetailPage } from '../pages/employees/EmployeeDetailPage'
import { EmployeeEditPage } from '../pages/employees/EmployeeEditPage'
import { EmployeeListPage } from '../pages/employees/EmployeeListPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { OrganizationPage } from '../pages/OrganizationPage'
import { PermissionsPage } from '../pages/PermissionsPage'
import { RoleDetailPage } from '../pages/roles/RoleDetailPage'
import { RolesPage } from '../pages/roles/RolesPage'

function OnboardingRoute() {
  const { user } = useAuth()
  if (!canOnboardAnyRole(user?.permissions)) {
    return <Navigate to="/forbidden" replace />
  }
  return <OnboardingPage />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/activate" element={<ActivatePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="forbidden" element={<ForbiddenPage />} />

          <Route
            element={
              <ProtectedRoute permission={Permissions.EMPLOYEE_CREATE} />
            }
          >
            <Route path="employees/new" element={<EmployeeCreatePage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute permission={Permissions.EMPLOYEE_UPDATE} />
            }
          >
            <Route
              path="employees/:employeeId/edit"
              element={<EmployeeEditPage />}
            />
          </Route>

          <Route
            element={<ProtectedRoute permission={Permissions.EMPLOYEE_VIEW} />}
          >
            <Route path="employees" element={<EmployeeListPage />} />
            <Route
              path="employees/:employeeId"
              element={<EmployeeDetailPage />}
            />
          </Route>

          <Route path="onboarding" element={<OnboardingRoute />} />

          <Route
            element={
              <ProtectedRoute
                anyOf={[Permissions.EMPLOYEE_VIEW, Permissions.ROLE_MANAGE]}
              />
            }
          >
            <Route path="organization" element={<OrganizationPage />} />
          </Route>

          <Route
            element={<ProtectedRoute permission={Permissions.ROLE_MANAGE} />}
          >
            <Route path="roles" element={<RolesPage />} />
            <Route path="roles/:roleId" element={<RoleDetailPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
