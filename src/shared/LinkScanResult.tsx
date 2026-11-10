import type { ScanState } from '../core/types'
import { RiskIcon } from './RiskIcon'

const VERDICT_CLASS = { unsafe: 'level-known_scam', suspicious: 'level-likely_spam', no_issues: 'level-unknown_sender' } as const

export function LinkScanResult({ scan }: { scan: ScanState }) {
  return (
    <div className="scan-result" role="status">
      {scan.status === 'checking' ? (
        <p className="scan-checking">
          <span className="scan-spinner" aria-hidden="true" />
          Checking this link…
        </p>
      ) : (
        <div className={`scan-outcome ${VERDICT_CLASS[scan.result.verdict]}`}>
          <span className="scan-icon">
            {scan.result.verdict === 'unsafe' && <RiskIcon level="known_scam" size={22} />}
            {scan.result.verdict === 'suspicious' && <RiskIcon level="likely_spam" size={22} />}
            {scan.result.verdict === 'no_issues' && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9.6" stroke="currentColor" strokeWidth="2.2" />
                <path d="M12 11v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="7.5" r="1.3" fill="currentColor" />
              </svg>
            )}
          </span>
          <div>
            <p className="scan-headline">{scan.result.headline}.</p>
            <p className="scan-explanation">{scan.result.explanation}</p>
            <p className="scan-note">This demo checks the link’s address only.</p>
          </div>
        </div>
      )}
    </div>
  )
}
