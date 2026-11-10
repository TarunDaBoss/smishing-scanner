import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { Detection } from '../core/detection'
import type { LinkVerdict } from '../core/linkCheck'

interface Props {
  text: string
  detection: Detection | null
  /** False once the visitor has marked the message safe. */
  flagged: boolean
  scanVerdict?: LinkVerdict
}

/**
 * A message as it appears in a bubble. Links are always plain text, never
 * anchors: flagged ones can't be tapped, and the sample domains could be real
 * sites, so nothing here ever navigates anywhere.
 */
export function MessageText({ text, detection, flagged, scanVerdict }: Props) {
  const links = detection?.links ?? []
  const parts: ReactNode[] = []
  let cursor = 0

  links.forEach((link) => {
    parts.push(<Fragment key={`t${link.start}`}>{text.slice(cursor, link.start)}</Fragment>)
    parts.push(
      <span
        key={`l${link.start}`}
        className={flagged ? `link-disabled${scanVerdict === 'unsafe' ? ' link-struck' : ''}` : 'link-plain'}
      >
        {flagged && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="link-off-icon">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.6" />
            <path d="m5.8 5.8 12.4 12.4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        )}
        {text.slice(link.start, link.end)}
        {flagged && <span className="sr-only"> (link disabled)</span>}
      </span>,
    )
    cursor = link.end
  })
  parts.push(<Fragment key="end">{text.slice(cursor)}</Fragment>)

  return <>{parts}</>
}
