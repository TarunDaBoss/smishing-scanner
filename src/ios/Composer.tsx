import { useState } from 'react'
import type { FormEvent } from 'react'

export function Composer({ isContact, onSend }: { isContact: boolean; onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const ready = text.trim().length > 0

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!ready) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form className="ios-composer" onSubmit={submit}>
      <div className="ios-composer-field glass">
        <input
          type="text"
          aria-label="Message"
          placeholder={isContact ? 'iMessage' : 'Text Message • SMS'}
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
        />
        {ready && (
          <button type="submit" className="ios-send tap" data-sms={!isContact} aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 20V4.5M5.5 11 12 4.5 18.5 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
