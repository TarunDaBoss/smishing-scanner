import { LEVEL_LABEL } from '../core/detection'
import { RiskIcon } from '../shared/RiskIcon'
import { useNotification } from '../shared/useNotification'

export function NotificationBanner() {
  const { item, mounted, visible, buttonProps } = useNotification()
  const label = item ? LEVEL_LABEL[item.level] : ''

  return (
    <div className="ios-notification-region" role="status" aria-live="polite">
      {mounted && item && (
        <button
          key={item.id}
          type="button"
          className={`ios-notification glass level-${item.level}`}
          data-open={visible}
          aria-label={`New message from ${item.name}. ${label ? `Warning: ${label}. ` : ''}${item.text}. Open conversation.`}
          {...buttonProps}
        >
          <span className="ios-notification-app" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3.5c-5 0-9 3.3-9 7.5 0 2.5 1.4 4.7 3.7 6.1-.2 1.2-.8 2.3-1.5 3.2 1.8-.2 3.4-.9 4.7-1.9.7.1 1.4.2 2.1.2 5 0 9-3.3 9-7.6s-4-7.5-9-7.5Z" />
            </svg>
          </span>
          <span className="ios-notification-text">
            <span className="ios-notification-top">
              <span className="ios-notification-name">{item.name}</span>
              <span className="ios-notification-time">now</span>
            </span>
            {label && <span className="ios-notification-risk"><RiskIcon level={item.level} size={14} />{label}</span>}
            <span className="ios-notification-body">{item.text}</span>
          </span>
        </button>
      )}
    </div>
  )
}
