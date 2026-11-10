import { LEVEL_LABEL } from '../core/detection'
import type { Detection } from '../core/detection'
import { RiskIcon } from '../shared/RiskIcon'

export function WarningBanner({ detection, onOpen }: { detection: Detection; onOpen: () => void }) {
  const label = LEVEL_LABEL[detection.level]
  return (
    <button
      type="button"
      className={`ios-banner level-${detection.level}`}
      onClick={onOpen}
      aria-label={`Warning: ${label}. ${detection.summary} See why this was flagged.`}
    >
      <span className="ios-banner-icon"><RiskIcon level={detection.level} size={20} /></span>
      <span className="ios-banner-text">
        <span className="ios-banner-title">{label}</span>
        <span className="ios-banner-summary">{detection.summary}</span>
      </span>
      <span className="ios-banner-more">
        See why
        <svg width="7" height="12" viewBox="0 0 8 14" fill="none" aria-hidden="true">
          <path d="m1 1 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  )
}
