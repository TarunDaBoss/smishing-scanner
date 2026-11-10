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
    <li className="android-row-item">
      <button type="button" className="android-row" data-thread-row={thread.id} aria-label={spoken} onClick={() => actions.openThread(thread.id)}>
        <Avatar thread={thread} size={52} />
        <span className="android-row-body">
          <span className="android-row-top">
            <span className="android-row-name">{thread.name}</span>
            <span className="android-row-time">{time}</span>
          </span>
          {risk && (
            <span className={`android-row-risk level-${risk.level}`}>
              <RiskIcon level={risk.level} size={14} />
              {label}
            </span>
          )}
          <span className="android-row-bottom">
            <span className="android-row-preview">{last.text}</span>
            {thread.unread && <span className="android-unread" aria-hidden="true">1</span>}
          </span>
        </span>
      </button>
    </li>
  )
}
