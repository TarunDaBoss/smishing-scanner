import type { Thread } from '../core/types'
import { useComposer } from '../shared/useComposer'

export function Composer({ thread }: { thread: Thread }) {
  const { text, ready, onSubmit, setText } = useComposer(thread.id)

  return (
    <form className="android-composer" onSubmit={onSubmit}>
      <div className="android-composer-field">
        <input
          type="text"
          aria-label="Message"
          placeholder="Enter message"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
        />
        {ready && (
          <button type="submit" className="android-send tap" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
