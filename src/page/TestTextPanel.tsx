import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { SAMPLE_SCAM, SAMPLE_SPAM, SAMPLE_UNKNOWN } from '../core/seed'
import { useApp } from '../core/store'

const SAMPLES = [
  { name: 'Package fee scam', text: SAMPLE_SCAM },
  { name: 'Gift card prize', text: SAMPLE_SPAM },
  { name: 'Text from a stranger', text: SAMPLE_UNKNOWN },
]

/** Brings the phone back into view, so the notification is seen as it arrives. */
function revealPhone() {
  const phone = document.querySelector('.stage')
  if (!phone) return
  const narrow = window.matchMedia('(max-width: 639px)').matches
  if (narrow && document.activeElement instanceof HTMLElement) document.activeElement.blur()
  if (phone.getBoundingClientRect().top < 0) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    phone.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }
}

export function TestTextPanel() {
  const { actions } = useApp()
  const [text, setText] = useState('')
  const ready = text.trim().length > 0

  const send = (message: string) => {
    actions.receiveText(message)
    revealPhone()
  }

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (!ready) return
    send(text.trim())
    setText('')
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <section id="send-test" className="test-panel" aria-labelledby="send-test-title" tabIndex={-1}>
      <h2 id="send-test-title">Send a test text</h2>
      <ul className="test-samples">
        {SAMPLES.map((sample) => (
          <li key={sample.name}>
            <button type="button" className="test-sample" aria-label={`Send sample: ${sample.name}`} onClick={() => send(sample.text)}>
              <span className="test-sample-name">{sample.name}</span>
              <span className="test-sample-text">{sample.text}</span>
            </button>
          </li>
        ))}
      </ul>
      <form className="test-custom" onSubmit={submit}>
        <label htmlFor="test-message">Type your own message</label>
        <textarea id="test-message" value={text} maxLength={500} onChange={(event) => setText(event.target.value)} onKeyDown={onKeyDown} />
        <button type="submit" className="test-send" disabled={!ready}>Send</button>
      </form>
      <p className="test-note">It arrives from an unknown number. Nothing you type leaves this page, and refreshing clears it.</p>
    </section>
  )
}
