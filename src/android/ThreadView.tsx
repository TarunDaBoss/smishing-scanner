import { Fragment } from 'react'
import { LEVEL_LABEL } from '../core/detection'
import { useApp } from '../core/store'
import type { Thread } from '../core/types'
import { formatDay, isSameDay } from '../core/ui'
import { RiskIcon } from '../shared/RiskIcon'
import { SafeNote } from '../shared/SafeNote'
import { useThreadScreen } from '../shared/useThreadScreen'
import { Composer } from './Composer'
import { MessageBubble } from './MessageBubble'
import { WarningBanner } from './WarningBanner'

const CLUSTER_MS = 5 * 60_000

export function ThreadView({ thread }: { thread: Thread }) {
  const { state, actions } = useApp()
  const { risk, riskyMessage, hasWarning, scrollRef, backRef, onKeyDown, isFlagged } = useThreadScreen(thread)

  return (
    <div className="android-thread" onKeyDown={onKeyDown}>
      <header className={`android-appbar ${risk ? `level-${risk.level}` : ''}`}>
        <button ref={backRef} type="button" className="android-icon-button tap" aria-label="Back to Messages" onClick={actions.back} data-focus-fallback>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15.5 4 7.5 12l8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 className="android-appbar-title" data-risk={risk ? 'true' : 'false'}>{thread.name}</h2>

        {risk && riskyMessage && (
          <button
            type="button"
            className="android-icon-button tap android-risk-button"
            aria-label={`Warning: ${LEVEL_LABEL[risk.level]}. See why this was flagged.`}
            onClick={() => actions.openSheet(riskyMessage.id)}
          >
            <RiskIcon level={risk.level} size={24} />
          </button>
        )}
      </header>

      <div className="android-thread-scroll" ref={scrollRef}>
        <div className="android-messages">
          {thread.messages.map((message, index) => {
            const previous = thread.messages[index - 1]
            const next = thread.messages[index + 1]
            const showDay = !previous || !isSameDay(previous.at, message.at)
            const showTime = !next || next.direction !== message.direction || next.at - message.at > CLUSTER_MS
            const flagged = isFlagged(message)
            const scan = state.scans[message.id]
            return (
              <Fragment key={message.id}>
                {showDay && <p className="android-day">{formatDay(message.at)}</p>}
                {flagged && message.detection && <WarningBanner detection={message.detection} onOpen={() => actions.openSheet(message.id)} />}
                <MessageBubble
                  message={message}
                  showTime={showTime}
                  flagged={flagged}
                  scanVerdict={scan?.status === 'done' ? scan.result.verdict : undefined}
                />
              </Fragment>
            )
          })}
          {thread.markedSafe && hasWarning && <SafeNote onUndo={() => actions.undoSafe(thread.id)} />}
          {thread.blocked && <p className="android-blocked-note">You blocked this number.</p>}
        </div>
      </div>

      {!thread.blocked && <Composer thread={thread} />}
    </div>
  )
}
