import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useApp } from '../core/store'
import { usePresence } from '../core/ui'

/** Which screens are up, shared by both phones, so each only decides how they look. */
export function usePhoneScreens(navRef: RefObject<HTMLElement | null>, pushMs: number, sheetMs: number) {
  const { state } = useApp()

  const openThread = state.threads.find((thread) => thread.id === state.nav.threadId) ?? null
  const threadPresence = usePresence(openThread, pushMs)
  const openMessage = openThread?.messages.find((message) => message.id === state.nav.sheetMessageId) ?? null
  const sheetPresence = usePresence(openMessage, sheetMs)
  const alertThread = state.threads.find((candidate) => candidate.id === state.alertThreadId) ?? null
  const covered = sheetPresence.mounted || alertThread !== null

  // Going back returns keyboard focus to the conversation you came from.
  const lastThreadId = useRef<string | null>(null)
  useEffect(() => {
    if (openThread) {
      lastThreadId.current = openThread.id
    } else if (lastThreadId.current) {
      const id = lastThreadId.current
      lastThreadId.current = null
      navRef.current?.querySelector<HTMLElement>(`[data-thread-row="${id}"]`)?.focus({ preventScroll: true })
    }
  }, [openThread, navRef])

  return { openThread, threadPresence, sheetPresence, alertThread, covered }
}
