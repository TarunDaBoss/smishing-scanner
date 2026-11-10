import type { RiskLevel } from '../core/detection'

interface Props {
  level: RiskLevel
  size?: number
}

/** Each level has its own shape, so the icon still reads without color. */
export function RiskIcon({ level, size = 16 }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, className: 'risk-icon' } as const

  if (level === 'known_scam') {
    return (
      <svg {...common} fill="none">
        <path d="M12 3.2 22.2 20.8H1.8Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M12 9.7v5.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="17.6" r="1.3" fill="currentColor" />
      </svg>
    )
  }

  if (level === 'likely_spam') {
    return (
      <svg {...common} fill="none">
        <circle cx="12" cy="12" r="9.6" stroke="currentColor" strokeWidth="2.2" />
        <path d="M12 6.9v6.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.7" r="1.3" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg {...common} fill="none">
      <circle cx="12" cy="12" r="9.6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M9.2 9.3a2.9 2.9 0 1 1 4.5 2.4c-1 .7-1.7 1.3-1.7 2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.4" r="1.3" fill="currentColor" />
    </svg>
  )
}
