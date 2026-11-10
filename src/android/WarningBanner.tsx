import { LEVEL_LABEL } from '../core/detection'
import type { Detection } from '../core/detection'
import { RiskIcon } from '../shared/RiskIcon'

export function WarningBanner({ detection, onOpen }: { detection: Detection; onOpen: () => void }) {
  const label = LEVEL_LABEL[detection.level]
  return (
    <button
      type="button"
      className={`android-banner level-${detection.level}`}
      onClick={onOpen}
      aria-label={`Warning: ${label}. ${detection.summary} See why this was flagged.`}
    >
      <span className="android-banner-icon"><RiskIcon level={detection.level} size={20} /></span>
      <span className="android-banner-text">
        <span className="android-banner-title">{label}</span>
        <span className="android-banner-summary">{detection.summary}</span>
      </span>
      <span className="android-banner-more">See why</span>
    </button>
  )
}
