const TOKEN_KEY = 'hrms.accessToken'
const USER_KEY = 'hrms.authUser'

export function getStoredAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredAuthUser() {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function storeAuth(accessToken, user) {
  sessionStorage.setItem(TOKEN_KEY, accessToken)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
