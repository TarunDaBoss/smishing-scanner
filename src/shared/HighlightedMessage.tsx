import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { Highlight } from '../core/detection'

/** The message as read in the sheet, with the suspicious phrases marked. */
export function HighlightedMessage({ text, highlights }: { text: string; highlights: Highlight[] }) {
  const parts: ReactNode[] = []
  let cursor = 0
  for (const highlight of highlights) {
    parts.push(<Fragment key={`t${highlight.start}`}>{text.slice(cursor, highlight.start)}</Fragment>)
    parts.push(<mark key={`m${highlight.start}`}>{text.slice(highlight.start, highlight.end)}</mark>)
    cursor = highlight.end
  }
  parts.push(<Fragment key="end">{text.slice(cursor)}</Fragment>)
  return <p className="highlighted-message">{parts}</p>
}
