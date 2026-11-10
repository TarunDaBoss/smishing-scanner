import { useRef } from 'react'
import { useApp } from '../core/store'
import type { Message, Thread } from '../core/types'
import { useDialogFocus } from '../core/ui'
import { useSheetDrag } from '../shared/useSheetDrag'
import { WhyFlaggedBody } from '../shared/WhyFlaggedBody'

interface Props {
  thread: Thread
  message: Message
  visible: boolean
  inert: boolean
}

export function WhyFlaggedSheet({ thread, message, visible, inert }: Props) {
  const { actions } = useApp()
  const sheetRef = useRef<HTMLDivElement>(null)
  useDialogFocus(sheetRef, actions.back)
  const dragProps = useSheetDrag(sheetRef, actions.back)
  const level = message.detection?.level

  return (
    <>
      <div className="ios-scrim" data-open={visible} onClick={actions.back} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={`ios-sheet glass level-${level}`}
        data-open={visible}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-sheet-title"
        tabIndex={-1}
        inert={inert}
      >
        <header className="ios-sheet-head" {...dragProps}>
          <span className="ios-grabber" aria-hidden="true" />
          <h2 id="ios-sheet-title" className="ios-sheet-title">Why this was flagged</h2>
          <button type="button" className="ios-circle glass ios-sheet-close tap" aria-label="Close" onClick={actions.back} data-autofocus>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="m2 2 10 10M12 2 2 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <WhyFlaggedBody thread={thread} message={message} sheetRef={sheetRef} />
      </div>
    </>
  )
}
