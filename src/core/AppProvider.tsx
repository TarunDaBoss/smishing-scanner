import { useCallback, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import { AppContext, initialState, reducer } from './store'
import type { AppActions } from './store'
import type { Nav } from './types'
import { useBackStack } from './useBackStack'

const SCAN_MS = 1500
let nextMessageId = 1

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const navRef = useRef(state.nav)
  useLayoutEffect(() => {
    navRef.current = state.nav
  }, [state.nav])

  const onNav = useCallback((nav: Nav) => dispatch({ type: 'nav', nav }), [])
  const { push, back, backToList } = useBackStack(onNav)

  const actions = useMemo<AppActions>(
    () => ({
      setPlatform: (platform) => dispatch({ type: 'set-platform', platform }),
      openThread: (threadId) => push({ threadId, sheetMessageId: null }),
      openSheet: (messageId) => push({ threadId: navRef.current.threadId, sheetMessageId: messageId }),
      back,
      sendMessage: (threadId, text) =>
        dispatch({
          type: 'send',
          threadId,
          message: { id: `sent-${nextMessageId++}`, direction: 'out', text, at: Date.now(), detection: null },
        }),
      reportAndDelete: (threadId) => {
        dispatch({ type: 'delete-thread', threadId })
        backToList(navRef.current)
      },
      undoDelete: () => dispatch({ type: 'restore-deleted' }),
      clearToast: (id) => dispatch({ type: 'clear-toast', id }),
      askBlock: (threadId) => dispatch({ type: 'ask-block', threadId }),
      cancelBlock: () => dispatch({ type: 'cancel-block' }),
      confirmBlock: () => {
        dispatch({ type: 'confirm-block' })
        if (navRef.current.sheetMessageId) back()
      },
      markSafe: (threadId) => {
        dispatch({ type: 'set-safe', threadId, safe: true })
        if (navRef.current.sheetMessageId) back()
      },
      undoSafe: (threadId) => dispatch({ type: 'set-safe', threadId, safe: false }),
      scanLink: (messageId, link) => {
        dispatch({ type: 'scan-start', messageId })
        // The check itself is instant and reads only the address. The pause
        // is here so the result feels like a step, as the brief asks.
        window.setTimeout(() => dispatch({ type: 'scan-done', messageId, result: link }), SCAN_MS)
      },
    }),
    [back, backToList, push],
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
