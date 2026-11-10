import { formatClock, useClock } from '../core/ui'

export function StatusBar() {
  const now = useClock()
  return (
    <div className="ios-status" aria-hidden="true">
      <span className="ios-status-time">{formatClock(now)}</span>
      <span className="ios-status-icons">
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
          <rect x="0" y="8" width="3.2" height="4" rx="1" />
          <rect x="5.1" y="5.4" width="3.2" height="6.6" rx="1" />
          <rect x="10.2" y="2.8" width="3.2" height="9.2" rx="1" />
          <rect x="15.3" y="0" width="3.2" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.3A10.7 10.7 0 0 0 8.5.5 10.7 10.7 0 0 0 1.1 3.5l1.2 1.3A8.8 8.8 0 0 1 8.5 2.3Z" />
          <path d="M8.5 6.2c1.3 0 2.5.5 3.4 1.4l1.3-1.3A6.6 6.6 0 0 0 8.5 4.4c-1.8 0-3.5.7-4.7 1.9l1.3 1.3c.9-.9 2.1-1.4 3.4-1.4Z" />
          <path d="M8.5 8.2c-.8 0-1.5.3-2 .8l2 2.2 2-2.2c-.5-.5-1.2-.8-2-.8Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}
