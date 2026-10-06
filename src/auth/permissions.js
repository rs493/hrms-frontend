import { Permissions } from '../types/permission'

export { Permissions }

export function hasPermission(userPermissions, permission) {
  if (!userPermissions?.length) {
    return false
  }
  return userPermissions.includes(permission)
}

export function hasAnyPermission(userPermissions, permissions) {
  return permissions.some((permission) =>
    hasPermission(userPermissions, permission),
  )
}

export function hasRole(userRoles, role) {
  return Boolean(userRoles?.includes(role))
}

/** Permission required to onboard a given role (matches OnboardingServiceImpl). */
export function onboardingPermissionForRole(role) {
  switch (role) {
    case 'ADMIN':
      return Permissions.ADMIN_CREATE
    case 'HR':
      return Permissions.HR_CREATE
    case 'MANAGER':
      return Permissions.MANAGER_CREATE
    case 'EMPLOYEE':
      return Permissions.EMPLOYEE_CREATE
    case 'SUPER_ADMIN':
      return null
    default:
      return null
  }
}

export function canOnboardAnyRole(userPermissions) {
  return hasAnyPermission(userPermissions, [
    Permissions.ADMIN_CREATE,
    Permissions.HR_CREATE,
    Permissions.MANAGER_CREATE,
    Permissions.EMPLOYEE_CREATE,
  ])
}
