import type { Highlight } from '../core/detection'

export function ReasonList({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) return null
  return (
    <ul className="reason-list">
      {highlights.map((highlight) => (
        <li key={highlight.start}>
          <span className="reason-phrase">“{highlight.text}”</span>
          <span className="reason-text">{highlight.reason}</span>
        </li>
      ))}
    </ul>
  )
}
