import { Fragment, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { LEVEL_LABEL } from '../core/detection'
import { threadRisk, useApp } from '../core/store'
import type { Thread } from '../core/types'
import { formatStamp } from '../core/ui'
import { RiskIcon } from '../shared/RiskIcon'
import { SafeNote } from '../shared/SafeNote'
import { Avatar } from './Avatar'
import { Composer } from './Composer'
import { MessageBubble } from './MessageBubble'
import { WarningBanner } from './WarningBanner'

const HOUR = 3_600_000

export function ThreadView({ thread }: { thread: Thread }) {
  const { state, actions } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const risk = threadRisk(thread)
  const riskyMessage = risk ? thread.messages.find((message) => message.detection === risk) : undefined
  const hasWarning = thread.messages.some((message) => message.detection && message.detection.level !== 'none')

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const scroller = scrollRef.current
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  }, [thread.messages.length, thread.markedSafe, thread.blocked])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') actions.back()
  }

  return (
    <div className="ios-thread" onKeyDown={onKeyDown}>
      <header className="ios-thread-bar">
        <button ref={backRef} type="button" className="ios-circle glass tap" aria-label="Back to Messages" onClick={actions.back} data-focus-fallback>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true">
            <path d="M10 2 2 10l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={`ios-thread-title ${risk ? `level-${risk.level}` : ''}`}>
          <Avatar thread={thread} size={52} />
          <h2 className="ios-thread-name glass" data-risk={risk ? 'true' : 'false'}>
            {thread.name}
          </h2>
        </div>

        {risk && riskyMessage ? (
          <button
            type="button"
            className={`ios-circle glass tap ios-risk-button level-${risk.level}`}
            aria-label={`Warning: ${LEVEL_LABEL[risk.level]}. See why this was flagged.`}
            onClick={() => actions.openSheet(riskyMessage.id)}
          >
            <RiskIcon level={risk.level} size={24} />
          </button>
        ) : (
          <span className="ios-circle-space" />
        )}
      </header>

      <div className="ios-thread-scroll" ref={scrollRef}>
        <div className="ios-messages">
          {thread.messages.map((message, index) => {
            const previous = thread.messages[index - 1]
            const next = thread.messages[index + 1]
            const showStamp = !previous || message.at - previous.at > HOUR
            const hasTail = !next || next.direction !== message.direction
            const detection = message.detection
            const flagged = !thread.markedSafe && detection !== null && detection.level !== 'none'
            const scan = state.scans[message.id]
            return (
              <Fragment key={message.id}>
                {showStamp && <p className="ios-stamp">{formatStamp(message.at)}</p>}
                {flagged && detection && <WarningBanner detection={detection} onOpen={() => actions.openSheet(message.id)} />}
                <MessageBubble
                  message={message}
                  hasTail={hasTail}
                  flagged={flagged}
                  isContact={thread.isContact}
                  scanVerdict={scan?.status === 'done' ? scan.result.verdict : undefined}
                />
              </Fragment>
            )
          })}
          {thread.markedSafe && hasWarning && <SafeNote onUndo={() => actions.undoSafe(thread.id)} />}
          {thread.blocked && <p className="ios-blocked-note">You blocked this number.</p>}
        </div>
      </div>

      {!thread.blocked && <Composer isContact={thread.isContact} onSend={(text) => actions.sendMessage(thread.id, text)} />}
    </div>
  )
}
