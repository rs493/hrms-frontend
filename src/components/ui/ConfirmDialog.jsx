import { Button } from './Button'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  loading,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 28, 38, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 40,
        padding: '1rem',
      }}
    >
      <div className="panel" style={{ width: 'min(100%, 420px)' }}>
        <div className="panel-section">
          <h2 id="confirm-dialog-title" className="section-title">
            {title}
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>{message}</p>
          <div className="inline-actions" style={{ marginTop: '1.25rem' }}>
            <Button variant="danger" loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
            <Button variant="secondary" disabled={loading} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
