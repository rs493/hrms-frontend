import { jwtDecode } from 'jwt-decode'

export function parseAuthUserFromToken(accessToken, expiresAt) {
  const claims = jwtDecode(accessToken)
  const userId = Number(claims.sub)
  if (!Number.isFinite(userId)) {
    throw new Error('Invalid token subject.')
  }

  return {
    userId,
    email: claims.email,
    roles: normalizeRoles(claims.roles),
    permissions: Array.isArray(claims.permissions)
      ? [...claims.permissions]
      : [],
    expiresAt,
  }
}

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return []
  }
  return roles.filter((role) => typeof role === 'string')
}
