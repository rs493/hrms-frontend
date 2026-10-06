export function Alert({ variant = 'info', children, role = 'alert' }) {
  return (
    <div className={`alert alert-${variant}`} role={role}>
      {children}
    </div>
  )
}
