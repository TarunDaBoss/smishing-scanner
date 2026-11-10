import type { Thread } from '../core/types'

export function Avatar({ thread, size }: { thread: Thread; size: number }) {
  if (thread.isContact) {
    return (
      <span className="android-avatar" style={{ width: size, height: size, background: thread.tint, fontSize: size * 0.44 }} aria-hidden="true">
        {thread.name.charAt(0)}
      </span>
    )
  }
  return (
    <span className="android-avatar android-avatar-unknown" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="7.5" r="5" />
        <path d="M2.5 22c.3-5.5 4.3-8.5 9.5-8.5s9.2 3 9.5 8.5c0 .6-.4 1-1 1h-17c-.6 0-1-.4-1-1Z" />
      </svg>
    </span>
  )
}
