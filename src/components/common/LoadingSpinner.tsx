type LoadingSpinnerProps = {
  label?: string
}

function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-8"
      role="status"
      aria-live="polite"
    >
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  )
}

export default LoadingSpinner
