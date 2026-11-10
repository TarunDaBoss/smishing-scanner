import { useRef } from 'react'
import { useApp } from '../core/store'
import { useEdgeSwipeBack } from '../shared/useEdgeSwipeBack'
import { usePhoneScreens } from '../shared/usePhoneScreens'
import { ConfirmAlert } from './ConfirmAlert'
import { ConversationList } from './ConversationList'
import { StatusBar } from './StatusBar'
import { ThreadView } from './ThreadView'
import { Toast } from './Toast'
import { WhyFlaggedSheet } from './WhyFlaggedSheet'

const PUSH_MS = 460
const SHEET_MS = 420
const SWIPE = { bothEdges: false, commitDistance: 0.38 }

export function IOSApp({ framed }: { framed: boolean }) {
  const { actions } = useApp()
  const navRef = useRef<HTMLDivElement>(null)
  const { openThread, threadPresence, sheetPresence, alertThread, covered } = usePhoneScreens(navRef, PUSH_MS, SHEET_MS)
  const thread = threadPresence.item

  useEdgeSwipeBack(navRef, openThread !== null && !covered, actions.back, SWIPE)

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
