import { useCallback, useEffect } from 'react'
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
  useEffect(() => {
    // State lives in memory, so a reload always starts back at the list.
    history.replaceState(AT_LIST, '')
    const onPop = (event: PopStateEvent) => onChange(readNav(event.state))
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

  return { push, back, backToList }
}
