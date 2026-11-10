import { useApp } from '../core/store'
import type { Platform } from '../core/types'

function PhoneGlyph({ platform }: { platform: Platform }) {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="12" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      {platform === 'ios' ? <rect x="4.6" y="3.2" width="4.8" height="1.8" rx="0.9" fill="currentColor" /> : <circle cx="7" cy="4.1" r="1.1" fill="currentColor" />}
    </svg>
  )
}

const OPTIONS: { value: Platform; label: string }[] = [
  { value: 'ios', label: 'iPhone' },
  { value: 'android', label: 'Android' },
]

export function PlatformSwitch() {
  const { state, actions } = useApp()
  return (
    <fieldset className="switch">
      <legend className="sr-only">Phone type</legend>
      {OPTIONS.map((option) => (
        <label key={option.value} className="switch-option" data-active={state.platform === option.value}>
          <input
            type="radio"
            name="platform"
            value={option.value}
            checked={state.platform === option.value}
            onChange={() => actions.setPlatform(option.value)}
          />
          <PhoneGlyph platform={option.value} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
