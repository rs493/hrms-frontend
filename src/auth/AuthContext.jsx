import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../api/authApi'
import { clearAuthClientState, setAuthFailureHandler } from '../api/client'
import { hasPermission, hasRole } from './permissions'

const AuthContext = createContext(null)

function toAuthUser(response) {
  if (!response?.userId) {
    return null
  }
  return {
    userId: response.userId,
    email: response.email,
    roles: Array.isArray(response.roles) ? [...response.roles] : [],
    permissions: Array.isArray(response.permissions)
      ? [...response.permissions]
      : [],
    expiresAt: response.expiresAt ?? null,
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  const clearSession = useCallback(() => {
    clearAuthClientState()
    setUser(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Backend logout may fail if the session is already invalid.
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }, [clearSession, navigate])

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession()
      navigate('/login', { replace: true })
    })
  }, [clearSession, navigate])

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!cancelled) {
          setUser(toAuthUser(currentUser))
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false)
        }
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (request) => {
    await loginRequest(request)
    try {
      const currentUser = await getCurrentUser()
      const authUser = toAuthUser(currentUser)
      if (!authUser) {
        throw new Error('Unable to load user profile.')
      }
      setUser(authUser)
    } catch (error) {
      clearSession()
      throw error
    }
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: Boolean(user),
      login,
      logout,
      can: (permission) => hasPermission(user?.permissions, permission),
      isRole: (role) => hasRole(user?.roles, role),
    }),
    [user, bootstrapping, login, logout],
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
