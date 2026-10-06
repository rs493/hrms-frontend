import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { activateAccount } from '../api/onboardingApi'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { getErrorMessage } from '../utils/errors'

export function ActivatePage() {
  const [searchParams] = useSearchParams()
  const tokenFromLink = useMemo(
    () => searchParams.get('token')?.trim() ?? '',
    [searchParams],
  )

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!tokenFromLink) {
      nextErrors.token =
        'Activation token is missing. Open the link from your email.'
    }
    if (!newPassword) nextErrors.newPassword = 'New password is required.'
    else if (newPassword.length < 8) {
      nextErrors.newPassword = 'Password must be between 8 and 255 characters.'
    }
    if (!confirmPassword)
      nextErrors.confirmPassword = 'Confirm password is required.'
    else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword =
        'New password and confirm password must match.'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const response = await activateAccount({
        token: tokenFromLink,
        newPassword,
        confirmPassword,
      })
      setResult(response)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to activate account.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card stack">
        <div>
          <div className="brand" style={{ marginBottom: '1rem' }}>
            <span className="brand-mark">HRMS</span>
          </div>
          <h1>Activate account</h1>
          <p className="lead">
            Set a new password to finish activating your invited account.
          </p>
        </div>

        {result ? (
          <>
            <Alert variant="success" role="status">
              Account activated for {result.email}. You can now sign in.
            </Alert>
            <Link className="btn btn-primary" to="/login">
              Go to login
            </Link>
          </>
        ) : (
          <form className="stack" onSubmit={onSubmit} noValidate>
            {error ? <Alert variant="error">{error}</Alert> : null}
            {!tokenFromLink ? (
              <Alert variant="error">
                No activation token was found in the URL. Use the link from your
                onboarding email.
              </Alert>
            ) : null}

            {fieldErrors.token ? (
              <Alert variant="error">{fieldErrors.token}</Alert>
            ) : null}

            <FormField
              label="New password"
              htmlFor="newPassword"
              required
              error={fieldErrors.newPassword}
              hint="At least 8 characters"
            >
              <input
                id="newPassword"
                type="password"
                className="input"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </FormField>

            <FormField
              label="Confirm password"
              htmlFor="confirmPassword"
              required
              error={fieldErrors.confirmPassword}
            >
              <input
                id="confirmPassword"
                type="password"
                className="input"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </FormField>

            <Button
              type="submit"
              loading={submitting}
              disabled={!tokenFromLink}
            >
              Activate account
            </Button>

            <p className="hint" style={{ textAlign: 'center' }}>
              Already activated? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
