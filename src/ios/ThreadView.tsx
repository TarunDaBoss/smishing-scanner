import { Fragment } from 'react'
import { LEVEL_LABEL } from '../core/detection'
import { useApp } from '../core/store'
import type { Thread } from '../core/types'
import { formatStamp } from '../core/ui'
import { RiskIcon } from '../shared/RiskIcon'
import { SafeNote } from '../shared/SafeNote'
import { useThreadScreen } from '../shared/useThreadScreen'
import { Avatar } from './Avatar'
import { Composer } from './Composer'
import { MessageBubble } from './MessageBubble'
import { WarningBanner } from './WarningBanner'

const HOUR = 3_600_000

export function ThreadView({ thread }: { thread: Thread }) {
  const { state, actions } = useApp()
  const { risk, riskyMessage, hasWarning, scrollRef, backRef, onKeyDown, isFlagged } = useThreadScreen(thread)

  return (
    <div className="ios-thread" onKeyDown={onKeyDown}>
      <header className="ios-thread-bar">
        <button ref={backRef} type="button" className="ios-bar-button tap" aria-label="Back to Messages" onClick={actions.back} data-focus-fallback>
          <svg width="13" height="22" viewBox="0 0 12 20" fill="none" aria-hidden="true">
            <path d="M10 2 2 10l8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={`ios-thread-title ${risk ? `level-${risk.level}` : ''}`}>
          <Avatar thread={thread} size={48} />
          <h2 className="ios-thread-name" data-risk={risk ? 'true' : 'false'}>
            <span>{thread.name}</span>
            <svg width="5" height="9" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="m1 1 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </h2>
        </div>

        {risk && riskyMessage ? (
          <button
            type="button"
            className={`ios-bar-button tap ios-risk-button level-${risk.level}`}
            aria-label={`Warning: ${LEVEL_LABEL[risk.level]}. See why this was flagged.`}
            onClick={() => actions.openSheet(riskyMessage.id)}
          >
            <RiskIcon level={risk.level} size={25} />
          </button>
        ) : (
          <span className="ios-bar-button ios-bar-decor" aria-hidden="true">
            <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
              <rect x="1" y="2" width="19" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 8 7-4.2v12.4L20 12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </header>

      <div className="ios-thread-scroll" ref={scrollRef}>
        <div className="ios-messages">
          {thread.messages.map((message, index) => {
            const previous = thread.messages[index - 1]
            const next = thread.messages[index + 1]
            const showStamp = !previous || message.at - previous.at > HOUR
            const hasTail = !next || next.direction !== message.direction
            const flagged = isFlagged(message)
            const scan = state.scans[message.id]
            return (
              <Fragment key={message.id}>
                {showStamp && <p className="ios-stamp">{formatStamp(message.at)}</p>}
                {flagged && message.detection && <WarningBanner detection={message.detection} onOpen={() => actions.openSheet(message.id)} />}
                <MessageBubble
                  message={message}
                  hasTail={hasTail}
                  flagged={flagged}
                  isContact={thread.isContact}
                  scanVerdict={scan?.status === 'done' ? scan.result.verdict : undefined}
                />
                {!next && message.direction === 'out' && <p className="ios-delivered">{thread.isContact ? 'Delivered' : 'Sent as Text Message'}</p>}
              </Fragment>
            )
          })}
          {thread.markedSafe && hasWarning && <SafeNote onUndo={() => actions.undoSafe(thread.id)} />}
          {thread.blocked && <p className="ios-blocked-note">You blocked this number.</p>}
        </div>
      </div>

      {!thread.blocked && <Composer thread={thread} />}
    </div>
  )
}
