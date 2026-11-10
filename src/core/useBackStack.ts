import { useCallback, useEffect, useRef } from 'react'
import type { Nav } from './types'

const AT_LIST: Nav = { threadId: null, sheetMessageId: null }

function readNav(value: unknown): Nav {
  const nav = value as Partial<Nav> | null
  return { threadId: nav?.threadId ?? null, sheetMessageId: nav?.sheetMessageId ?? null }
}

/**
 * Ties the phone's screens to browser history, so the system back gesture and
 * the browser's Back button close the sheet or thread like a real app.
 */
export function useBackStack(onChange: (nav: Nav) => void) {
  const openAfterUnwind = useRef<Nav | null>(null)

  useEffect(() => {
    // State lives in memory, so a reload always starts back at the list.
    history.replaceState(AT_LIST, '')
    const onPop = (event: PopStateEvent) => {
      const next = openAfterUnwind.current
      openAfterUnwind.current = null
      if (next) {
        history.pushState(next, '')
        onChange(next)
      } else {
        onChange(readNav(event.state))
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [onChange])

  const push = useCallback(
    (nav: Nav) => {
      history.pushState(nav, '')
      onChange(nav)
    },
    [onChange],
  )

  const back = useCallback(() => history.back(), [])

  const backToList = useCallback((current: Nav) => {
    const depth = (current.threadId ? 1 : 0) + (current.sheetMessageId ? 1 : 0)
    if (depth > 0) history.go(-depth)
  }, [])

  /** Opens a screen directly above the list, so Back from it returns to the list, as a notification does. */
  const openFromList = useCallback(
    (nav: Nav, current: Nav) => {
      const depth = (current.threadId ? 1 : 0) + (current.sheetMessageId ? 1 : 0)
      if (depth === 0) {
        push(nav)
      } else {
        openAfterUnwind.current = nav
        history.go(-depth)
      }
    },
    [push],
  )

  return { push, back, backToList, openFromList }
}
