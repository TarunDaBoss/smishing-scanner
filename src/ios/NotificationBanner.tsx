import { LEVEL_LABEL } from '../core/detection'
import { RiskIcon } from '../shared/RiskIcon'
import { useNotification } from '../shared/useNotification'
import { Avatar } from './Avatar'

export function NotificationBanner() {
  const { item, mounted, visible, buttonProps } = useNotification()
  const label = item ? LEVEL_LABEL[item.level] : ''

  return (
    <div className="ios-notification-region" role="status" aria-live="polite">
      {mounted && item && (
        <button
          key={item.id}
          type="button"
          className={`ios-notification level-${item.level}`}
          data-open={visible}
          aria-label={`New message from ${item.name}. ${label ? `Warning: ${label}. ` : ''}${item.text}. Open conversation.`}
          {...buttonProps}
        >
          <span className="ios-notification-avatar" aria-hidden="true">
            <Avatar thread={{ isContact: false, name: item.name }} size={40} />
            <span className="ios-notification-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3.5c-5 0-9 3.3-9 7.5 0 2.5 1.4 4.7 3.7 6.1-.2 1.2-.8 2.3-1.5 3.2 1.8-.2 3.4-.9 4.7-1.9.7.1 1.4.2 2.1.2 5 0 9-3.3 9-7.6s-4-7.5-9-7.5Z" />
              </svg>
            </span>
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
