import type { Thread } from '../core/types'

export function Avatar({ thread, size }: { thread: Pick<Thread, 'isContact' | 'name' | 'tint'>; size: number }) {
  if (thread.isContact) {
    return (
      <span className="ios-avatar" style={{ width: size, height: size, background: thread.tint, fontSize: size * 0.44 }} aria-hidden="true">
        {thread.name.charAt(0)}
      </span>
    )
  }
  return (
    <span className="ios-avatar ios-avatar-unknown" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="23" r="10.5" fill="#fff" />
        <path d="M30 37c-10.5 0-18.5 5.2-20.5 12.5A29.9 29.9 0 0 0 30 60a29.9 29.9 0 0 0 20.5-10.5C48.5 42.2 40.5 37 30 37Z" fill="#fff" />
      </svg>
    </span>
  )
}
