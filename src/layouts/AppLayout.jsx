import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { canOnboardAnyRole } from '../auth/permissions'
import { Permissions } from '../types/permission'
import { formatRoleName } from '../utils/format'
import { Button } from '../components/ui/Button'

export function AppLayout() {
  const { user, logout, can } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = useMemo(
    () => [
      { to: '/', label: 'Dashboard', visible: true },
      {
        to: '/employees',
        label: 'Employees',
        visible: can(Permissions.EMPLOYEE_VIEW),
      },
      {
        to: '/onboarding',
        label: 'Onboarding',
        visible: canOnboardAnyRole(user?.permissions),
      },
      {
        to: '/organization',
        label: 'Organization',
        visible: can(Permissions.EMPLOYEE_VIEW) || can(Permissions.ROLE_MANAGE),
      },
      {
        to: '/roles',
        label: 'Roles',
        visible: can(Permissions.ROLE_MANAGE),
      },
      {
        to: '/permissions',
        label: 'Permissions',
        visible: can(Permissions.ROLE_MANAGE),
      },
    ],
    [can, user?.permissions],
  )

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            Menu
          </button>
          <div className="brand">
            <span className="brand-mark">HRMS</span>
            <span className="brand-sub">Workforce administration</span>
          </div>
        </div>
        <div className="user-chip">
          <div className="details">
            <div className="email">{user?.email}</div>
            <div className="roles">
              {user?.roles.map(formatRoleName).join(', ')}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <aside
        className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="nav-section-label">Modules</div>
        <nav>
          {items
            .filter((item) => item.visible)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
                onClick={closeSidebar}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <main className="app-main">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
