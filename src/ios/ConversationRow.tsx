import { LEVEL_LABEL } from '../core/detection'
import { lastMessage, threadRisk, useApp } from '../core/store'
import type { Thread } from '../core/types'
import { formatListTime } from '../core/ui'
import { RiskIcon } from '../shared/RiskIcon'
import { Avatar } from './Avatar'

export function ConversationRow({ thread }: { thread: Thread }) {
  const { actions } = useApp()
  const risk = threadRisk(thread)
  const last = lastMessage(thread)
  const time = formatListTime(last.at)
  const label = risk ? LEVEL_LABEL[risk.level] : ''
  const spoken = [thread.name, risk && `Warning: ${label}`, thread.blocked && 'Blocked', thread.unread && 'Unread', last.text, time].filter(Boolean).join('. ')

  return (
    <li className="ios-row-item">
      <button type="button" className="ios-row" data-thread-row={thread.id} aria-label={spoken} onClick={() => actions.openThread(thread.id)}>
        <span className="ios-unread" data-show={thread.unread} aria-hidden="true" />
        <Avatar thread={thread} size={56} />
        <span className="ios-row-body">
          <span className="ios-row-top">
            <span className="ios-row-name">{thread.name}</span>
            <span className="ios-row-time">{time}</span>
            <svg className="ios-row-chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="m1 1 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {risk && (
            <span className={`ios-row-risk level-${risk.level}`}>
              <RiskIcon level={risk.level} size={14} />
              {label}
            </span>
          )}
          <span className="ios-row-preview" data-lines={risk ? 1 : 2}>{last.text}</span>
        </span>
      </button>
    </li>
  )
}
