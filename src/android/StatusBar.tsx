import { formatClock, useClock } from '../core/ui'

export function StatusBar() {
  const now = useClock()
  return (
    <div className="android-status" aria-hidden="true">
      <span>{formatClock(now)}</span>
      <span className="android-status-icons">
        <svg width="16" height="13" viewBox="0 0 16 13" fill="currentColor">
          <path d="M8 13 0 3.8C2.1 1.5 4.9.2 8 .2s5.9 1.3 8 3.6L8 13Z" />
        </svg>
        <svg width="15" height="14" viewBox="0 0 15 14" fill="currentColor">
          <path d="M15 0v14H0L15 0Z" />
        </svg>
        <svg width="24" height="13" viewBox="0 0 24 13" fill="none">
          <rect x="0.6" y="0.6" width="20.8" height="11.8" rx="3.4" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <rect x="2.2" y="2.2" width="17.6" height="8.6" rx="2" fill="currentColor" />
          <path d="M22.8 4.5v4c.7-.3 1.2-1.1 1.2-2s-.5-1.7-1.2-2Z" fill="currentColor" opacity="0.55" />
        </svg>
      </span>
    </div>
  )
}
