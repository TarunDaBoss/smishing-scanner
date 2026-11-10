import { useRef } from 'react'
import { useApp } from '../core/store'
import { useEdgeSwipeBack } from '../shared/useEdgeSwipeBack'
import { usePhoneScreens } from '../shared/usePhoneScreens'
import { ConfirmAlert } from './ConfirmAlert'
import { ConversationList } from './ConversationList'
import { StatusBar } from './StatusBar'
import { NotificationBanner } from './NotificationBanner'
import { ThreadView } from './ThreadView'
import { Toast } from './Toast'
import { WhyFlaggedSheet } from './WhyFlaggedSheet'

const PUSH_MS = 320
const SHEET_MS = 340
const SWIPE = { bothEdges: true, commitDistance: 0.22 }

export function AndroidApp({ framed }: { framed: boolean }) {
  const { actions } = useApp()
  const navRef = useRef<HTMLDivElement>(null)
  const { openThread, threadPresence, sheetPresence, alertThread, covered } = usePhoneScreens(navRef, PUSH_MS, SHEET_MS)
  const thread = threadPresence.item

  useEdgeSwipeBack(navRef, openThread !== null && !covered, actions.back, SWIPE)

  return (
    <div className="android" data-framed={framed}>
      {framed && <StatusBar />}

      <div className="android-nav" ref={navRef} data-pushed={threadPresence.visible}>
        <div className="android-layer android-list-layer" inert={openThread !== null || covered}>
          <ConversationList />
        </div>
        {threadPresence.mounted && thread && (
          <div className="android-layer android-thread-layer" data-open={threadPresence.visible} inert={!openThread || covered}>
            <ThreadView key={thread.id} thread={thread} />
          </div>
        )}
      </div>

      {sheetPresence.mounted && sheetPresence.item && thread && (
        <WhyFlaggedSheet thread={thread} message={sheetPresence.item} visible={sheetPresence.visible} inert={alertThread !== null} />
      )}
      {alertThread && <ConfirmAlert thread={alertThread} />}
      <Toast />
      <NotificationBanner />
      {framed && <div className="android-gesture-bar" aria-hidden="true" />}
    </div>
  )
}
