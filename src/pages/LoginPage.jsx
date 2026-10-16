import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { LoadingBlock } from '../components/ui/StateBlock'
import { getErrorMessage } from '../utils/errors'

export function LoginPage() {
  const { login, isAuthenticated, bootstrapping } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (bootstrapping) {
    return <LoadingBlock label="Checking session…" />
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!password) nextErrors.password = 'Password is required.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card stack" onSubmit={onSubmit} noValidate>
        <div>
          <div className="brand" style={{ marginBottom: '1rem' }}>
            <span className="brand-mark">HRMS</span>
          </div>
          <h1>Sign in</h1>
          <p className="lead">Use your work email and password to continue.</p>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <FormField
          label="Email"
          htmlFor="email"
          required
          error={fieldErrors.email}
        >
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={fieldErrors.password}
        >
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>

        <Button type="submit" loading={submitting}>
          Sign in
        </Button>

        <p className="hint" style={{ textAlign: 'center' }}>
          Activating a new account? Open the link from your onboarding email, or
          go to <Link to="/activate">account activation</Link>.
        </p>
      </form>
    </div>
  )
}
