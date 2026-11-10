import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

function dayDifference(at: number, now: number): number {
  const start = (value: number) => new Date(value).setHours(0, 0, 0, 0)
  return Math.round((start(now) - start(at)) / 86_400_000)
}

export function formatListTime(at: number): string {
  const days = dayDifference(at, Date.now())
  if (days === 0) return time.format(at)
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }).format(at)
}

export function formatStamp(at: number): string {
  const days = dayDifference(at, Date.now())
  const day = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(at)
  return `${day} ${time.format(at)}`
}

export function formatTime(at: number): string {
  return time.format(at)
}

export function formatDay(at: number): string {
  const days = dayDifference(at, Date.now())
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(at)
}

export function isSameDay(a: number, b: number): boolean {
  return dayDifference(a, b) === 0
}

export function formatClock(at: number): string {
  return time.format(at).replace(/\s?[AP]M$/i, '')
}

export function useClock(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/**
 * Keeps something on screen while it animates out. `visible` turns true a
 * frame after mounting so the entrance transition runs. Anything already open
 * when the component first mounts (after a platform switch) appears at once.
 */
export function usePresence<T>(value: T | null, exitMs: number) {
  const open = value !== null
  const [lastValue, setLastValue] = useState(value)
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)

  if (value !== null && value !== lastValue) setLastValue(value)
  if (open && !mounted) setMounted(true)
  if (!open && visible) setVisible(false)

  useEffect(() => {
    if (open) {
      let second = 0
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        cancelAnimationFrame(first)
        cancelAnimationFrame(second)
      }
    }
    const timer = window.setTimeout(() => setMounted(false), exitMs)
    return () => window.clearTimeout(timer)
  }, [open, exitMs])

  return { item: value ?? lastValue, mounted: open || mounted, visible: open && visible }
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

// Opening a dialog makes the screen behind it inert, which clears
// document.activeElement. This remembers what really had focus.
let lastFocused: HTMLElement | null = null
document.addEventListener('focusin', (event) => {
  lastFocused = event.target as HTMLElement
})

/** Flipping the phone type re-renders the phone, and shouldn't pull focus off the switch. */
export function focusIsOnPlatformSwitch(): boolean {
  return document.activeElement?.closest('.switch') != null
}

/** Keeps Tab inside a dialog, closes on Escape, and puts focus back afterwards. */
export function useDialogFocus(ref: RefObject<HTMLElement | null>, onEscape: () => void) {
  const returnFocus = useRef(lastFocused)
  const escape = useRef(onEscape)
  useEffect(() => {
    escape.current = onEscape
  }, [onEscape])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const previous = returnFocus.current
    const target = element.querySelector<HTMLElement>('[data-autofocus]') ?? element
    if (!focusIsOnPlatformSwitch()) target.focus({ preventScroll: true })

    // Listens on the document so these keys still work if the focused button
    // disappears. A dialog covered by another dialog is inert and stays out of it.
    const onKeyDown = (event: KeyboardEvent) => {
      if (element.inert) return
      if (event.key === 'Escape') {
        event.stopPropagation()
        escape.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...element.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!element.contains(active)) {
        if (focusIsOnPlatformSwitch()) return
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (active === first || active === element)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // The button that opened this may be gone, like a banner after "This Is Safe".
      const returnTo = previous?.isConnected ? previous : document.querySelector<HTMLElement>('[data-focus-fallback]')
      returnTo?.focus({ preventScroll: true })
    }
  }, [ref])
}
