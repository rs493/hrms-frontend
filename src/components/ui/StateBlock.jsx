import { Button } from './Button'

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="state-block" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p style={{ marginTop: '0.75rem' }}>{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children,
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {children}
      {actionLabel && onAction ? (
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  )
}

export function ErrorState({ title, description, onRetry }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {onRetry ? (
        <div style={{ marginTop: '1rem' }}>
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}
