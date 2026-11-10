import { useEffect, useRef } from 'react'
import { useApp } from '../core/store'
import { usePresence } from '../core/ui'
import { ConfirmAlert } from './ConfirmAlert'
import { ConversationList } from './ConversationList'
import { StatusBar } from './StatusBar'
import { ThreadView } from './ThreadView'
import { Toast } from './Toast'
import { useEdgeSwipeBack } from './useEdgeSwipeBack'
import { WhyFlaggedSheet } from './WhyFlaggedSheet'

const PUSH_MS = 460
const SHEET_MS = 420

export function IOSApp({ framed }: { framed: boolean }) {
  const { state, actions } = useApp()
  const navRef = useRef<HTMLDivElement>(null)

  const openThread = state.threads.find((thread) => thread.id === state.nav.threadId) ?? null
  const threadPresence = usePresence(openThread, PUSH_MS)
  const thread = threadPresence.item

  const openMessage = openThread?.messages.find((message) => message.id === state.nav.sheetMessageId) ?? null
  const sheetPresence = usePresence(openMessage, SHEET_MS)
  const alertThread = state.threads.find((candidate) => candidate.id === state.alertThreadId) ?? null

  const covered = sheetPresence.mounted || alertThread !== null
  useEdgeSwipeBack(navRef, openThread !== null && !covered, actions.back)

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
  }, [openThread])

  return (
    <div className="ios" data-framed={framed}>
      {framed && <StatusBar />}

      <div className="ios-nav" ref={navRef} data-pushed={threadPresence.visible}>
        <div className="ios-layer ios-list-layer" inert={openThread !== null || covered}>
          <ConversationList />
        </div>
        {threadPresence.mounted && thread && (
          <div className="ios-layer ios-thread-layer" data-open={threadPresence.visible} inert={!openThread || covered}>
            <ThreadView thread={thread} />
          </div>
        )}
      </div>

      {sheetPresence.mounted && sheetPresence.item && thread && (
        <WhyFlaggedSheet thread={thread} message={sheetPresence.item} visible={sheetPresence.visible} inert={alertThread !== null} />
      )}
      {alertThread && <ConfirmAlert thread={alertThread} />}
      <Toast />
      {framed && <div className="ios-home-indicator" aria-hidden="true" />}
    </div>
  )
}
