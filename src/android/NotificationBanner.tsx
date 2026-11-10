import { LEVEL_LABEL } from '../core/detection'
import { RiskIcon } from '../shared/RiskIcon'
import { useNotification } from '../shared/useNotification'

export function NotificationBanner() {
  const { item, mounted, visible, buttonProps } = useNotification()
  const label = item ? LEVEL_LABEL[item.level] : ''

  return (
    <div className="android-notification-region" role="status" aria-live="polite">
      {mounted && item && (
        <button
          key={item.id}
          type="button"
          className={`android-notification level-${item.level}`}
          data-open={visible}
          aria-label={`New message from ${item.name}. ${label ? `Warning: ${label}. ` : ''}${item.text}. Open conversation.`}
          {...buttonProps}
        >
          <span className="android-notification-app" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H9l-5 4V5.5Z" fill="currentColor" />
            </svg>
          </span>
          <span className="android-notification-text">
            <span className="android-notification-meta">Messages • now</span>
            <span className="android-notification-name">{item.name}</span>
            {label && <span className="android-notification-risk"><RiskIcon level={item.level} size={14} />{label}</span>}
            <span className="android-notification-body">{item.text}</span>
          </span>
        </button>
      )}
    </div>
  )
}
