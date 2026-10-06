import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../api/authApi'
import { setAuthFailureHandler } from '../api/client'
import { parseAuthUserFromToken } from './jwt'
import { hasPermission, hasRole } from './permissions'
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredAuthUser,
  storeAuth,
} from './tokenStorage'

const AuthContext = createContext(null)

function isExpired(expiresAt) {
  const expiry = Date.parse(expiresAt)
  if (Number.isNaN(expiry)) {
    return true
  }
  return expiry <= Date.now()
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const token = getStoredAccessToken()
    const stored = getStoredAuthUser()
    if (!token || !stored || isExpired(stored.expiresAt)) {
      clearStoredAuth()
      return null
    }
    return stored
  })

  const logout = useCallback(() => {
    clearStoredAuth()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  const login = useCallback(async (request) => {
    const response = await loginRequest(request)
    const authUser = parseAuthUserFromToken(
      response.accessToken,
      response.expiresAt,
    )
    storeAuth(response.accessToken, authUser)
    setUser(authUser)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      can: (permission) => hasPermission(user?.permissions, permission),
      isRole: (role) => hasRole(user?.roles, role),
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }
  return context
}
