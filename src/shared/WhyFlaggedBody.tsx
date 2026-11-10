import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { LEVEL_LABEL } from '../core/detection'
import { useApp } from '../core/store'
import type { Message, Thread } from '../core/types'
import { HighlightedMessage } from './HighlightedMessage'
import { LinkScanResult } from './LinkScanResult'
import { ReasonList } from './ReasonList'
import { RiskIcon } from './RiskIcon'

interface Props {
  thread: Thread
  message: Message
  sheetRef: RefObject<HTMLElement | null>
}

/** The contents of "Why this was flagged". Each phone styles it and supplies its own sheet around it. */
export function WhyFlaggedBody({ thread, message, sheetRef }: Props) {
  const { state, actions } = useApp()
  const scanRef = useRef<HTMLDivElement>(null)
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

  return (
    <div className="sheet-body">
      <div className="sheet-level">
        <span className="sheet-badge"><RiskIcon level={detection.level} size={20} />{LEVEL_LABEL[detection.level]}</span>
        <span className="sheet-confidence">Confidence: <strong>{detection.confidence}</strong></span>
      </div>

      <section className="sheet-card" aria-label="The message">
        <HighlightedMessage text={message.text} highlights={detection.highlights} />
      </section>

      {detection.highlights.length > 0 && (
        <section className="sheet-card" aria-label="What looks suspicious">
          <ReasonList highlights={detection.highlights} />
        </section>
      )}

      <ul className="sheet-facts">
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

      <div className="sheet-actions">
        <button type="button" className="sheet-action sheet-action-danger" onClick={() => actions.reportAndDelete(thread.id)}>Report and Delete</button>
        <div className="sheet-more">
          {worstLink && !scan && <button type="button" className="sheet-action" onClick={startScan}>Scan Link</button>}
          {!thread.blocked && <button type="button" className="sheet-action" onClick={() => actions.askBlock(thread.id)}>Block Sender</button>}
          <button type="button" className="sheet-action" onClick={() => actions.markSafe(thread.id)}>This Is Safe</button>
        </div>
      </div>
    </div>
  )
}
