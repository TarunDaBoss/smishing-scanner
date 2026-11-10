import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { Thread } from '../core/types'
import { useMediaQuery } from '../core/ui'
import { useComposer } from '../shared/useComposer'
import { Keyboard } from './Keyboard'

/** Keeps focus in the message field, as tapping these on a real phone would. */
const keepFocus = (event: MouseEvent) => event.preventDefault()

export function Composer({ thread }: { thread: Thread }) {
  const { text, ready, send, onSubmit, setText } = useComposer(thread.id)
  const [focused, setFocused] = useState(false)
  const canDrawKeyboard = useMediaQuery('(min-width: 640px) and (hover: hover) and (pointer: fine)')
  const keyboardOpen = canDrawKeyboard && focused

  return (
    <>
      <form className="ios-composer" onSubmit={onSubmit} data-keyboard={keyboardOpen}>
        <span className="ios-composer-decor" aria-hidden="true">
          <svg width="30" height="24" viewBox="0 0 30 24" fill="currentColor">
            <path d="M10.6 2.5A2.5 2.5 0 0 1 12.8 1h4.4a2.5 2.5 0 0 1 2.2 1.5L20.3 4H25a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h4.7l.9-1.5ZM15 19.5a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-2.2a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6Z" fillRule="evenodd" />
          </svg>
        </span>
        <span className="ios-composer-decor" aria-hidden="true">
          <span className="ios-composer-apps">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" />
            </svg>
          </span>
        </span>
        <div className="ios-composer-field">
          <input
            type="text"
            aria-label="Message"
            placeholder={thread.isContact ? 'iMessage' : 'Text Message • SMS'}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
          />
          {ready ? (
            <button type="submit" className="ios-send tap" data-sms={!thread.isContact} aria-label="Send message" onMouseDown={keepFocus}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20V4.5M5.5 11 12 4.5 18.5 11" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="ios-composer-mic" aria-hidden="true">
              <svg width="15" height="21" viewBox="0 0 15 21" fill="none">
                <rect x="4.5" y="1" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M1 10c0 3.8 2.9 6.5 6.5 6.5S14 13.8 14 10M7.5 16.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </div>
      </form>
      {canDrawKeyboard && <Keyboard open={keyboardOpen} text={text} ready={ready} onText={setText} onSend={send} />}
    </>
  )
}
