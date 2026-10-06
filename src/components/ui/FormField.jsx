export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className = '',
}) {
  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={htmlFor} className={required ? 'required' : undefined}>
        {label}
      </label>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
      {error ? (
        <span className="error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
