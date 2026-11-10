import type { Thread } from '../core/types'
import { useComposer } from '../shared/useComposer'

export function Composer({ thread }: { thread: Thread }) {
  const { text, ready, onSubmit, setText } = useComposer(thread.id)

  return (
    <form className="ios-composer" onSubmit={onSubmit}>
      <div className="ios-composer-field glass">
        <input
          type="text"
          aria-label="Message"
          placeholder={thread.isContact ? 'iMessage' : 'Text Message • SMS'}
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
        />
        {ready && (
          <button type="submit" className="ios-send tap" data-sms={!thread.isContact} aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 20V4.5M5.5 11 12 4.5 18.5 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
