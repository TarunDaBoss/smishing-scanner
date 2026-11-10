import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'
import { LEVEL_LABEL } from '../core/detection'
import { useApp } from '../core/store'
import type { Message, Thread } from '../core/types'
import { useDialogFocus } from '../core/ui'
import { HighlightedMessage } from '../shared/HighlightedMessage'
import { LinkScanResult } from '../shared/LinkScanResult'
import { ReasonList } from '../shared/ReasonList'
import { RiskIcon } from '../shared/RiskIcon'

const DISMISS_DISTANCE = 110

interface Props {
  thread: Thread
  message: Message
  visible: boolean
  inert: boolean
}

export function WhyFlaggedSheet({ thread, message, visible, inert }: Props) {
  const { state, actions } = useApp()
  const sheetRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; startY: number; distance: number } | null>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  useDialogFocus(sheetRef, actions.back)

  const scan = state.scans[message.id]
  const scanStatus = scan?.status
  useEffect(() => {
    if (scanStatus) scanRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [scanStatus])

  const detection = message.detection
  if (!detection) return null

  const worstLink = detection.worstLink

  const startScan = () => {
    if (!worstLink) return
    // The button is about to be replaced by the result, so keep focus in the sheet.
    sheetRef.current?.focus({ preventScroll: true })
    actions.scanLink(message.id, worstLink)
  }

  const onDragStart = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    drag.current = { id: event.pointerId, startY: event.clientY, distance: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    sheetRef.current?.classList.add('is-dragging')
  }

  const onDragMove = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== event.pointerId) return
    drag.current.distance = Math.max(0, event.clientY - drag.current.startY)
    sheetRef.current?.style.setProperty('--sheet-drag', `${drag.current.distance}px`)
  }

  const onDragEnd = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== event.pointerId) return
    const shouldClose = drag.current.distance > DISMISS_DISTANCE
    drag.current = null
    sheetRef.current?.classList.remove('is-dragging')
    sheetRef.current?.style.removeProperty('--sheet-drag')
    if (shouldClose) actions.back()
  }

  return (
    <>
      <div className="ios-scrim" data-open={visible} onClick={actions.back} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={`ios-sheet glass level-${detection.level}`}
        data-open={visible}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-sheet-title"
        tabIndex={-1}
        inert={inert}
      >
        <header className="ios-sheet-head" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd}>
          <span className="ios-grabber" aria-hidden="true" />
          <h2 id="ios-sheet-title" className="ios-sheet-title">Why this was flagged</h2>
          <button type="button" className="ios-circle glass ios-sheet-close tap" aria-label="Close" onClick={actions.back} data-autofocus>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="m2 2 10 10M12 2 2 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="ios-sheet-body">
          <div className="ios-sheet-level">
            <span className="ios-sheet-badge"><RiskIcon level={detection.level} size={20} />{LEVEL_LABEL[detection.level]}</span>
            <span className="ios-sheet-confidence">Confidence: <strong>{detection.confidence}</strong></span>
          </div>

          <section className="ios-sheet-card" aria-label="The message">
            <HighlightedMessage text={message.text} highlights={detection.highlights} />
          </section>

          {detection.highlights.length > 0 && (
            <section className="ios-sheet-card" aria-label="What looks suspicious">
              <ReasonList highlights={detection.highlights} />
            </section>
          )}

          <ul className="ios-sheet-facts">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M3 20c.8-3.8 3.5-6 7-6s6.2 2.2 7 6M17 5.5a3.5 3.5 0 0 1 0 5M20 15.5c.5 1.3.8 2.7 1 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Sender isn’t in your contacts.
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
              </svg>
              Checked on this phone. Your messages stay private.
            </li>
          </ul>

          {worstLink && scan && (
            <div ref={scanRef}>
              <LinkScanResult scan={scan} />
            </div>
          )}

          <div className="ios-sheet-actions">
            <button type="button" className="ios-action ios-action-danger" onClick={() => actions.reportAndDelete(thread.id)}>Report and Delete</button>
            <div className="ios-sheet-more">
              {worstLink && !scan && <button type="button" className="ios-action" onClick={startScan}>Scan Link</button>}
              {!thread.blocked && <button type="button" className="ios-action" onClick={() => actions.askBlock(thread.id)}>Block Sender</button>}
              <button type="button" className="ios-action" onClick={() => actions.markSafe(thread.id)}>This Is Safe</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
