import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useApp } from '../core/store'
import { usePresence } from '../core/ui'

const SHOW_MS = 6000
const DISMISS_DISTANCE = 36

/** The incoming-text banner: it times out, waits while hovered or focused, and flicks away upward. */
export function useNotification() {
  const { state, actions } = useApp()
  const current = state.notification
  const presence = usePresence(current, 320)
  const [held, setHeld] = useState(false)
  const drag = useRef<{ id: number; startY: number; distance: number } | null>(null)
  const wasSwiped = useRef(false)

  useEffect(() => {
    if (!current || held) return
    const timer = window.setTimeout(() => actions.clearNotification(current.id), SHOW_MS)
    return () => window.clearTimeout(timer)
  }, [current, held, actions])

  const item = presence.item

  const buttonProps = {
    onClick: () => {
      if (wasSwiped.current) {
        wasSwiped.current = false
        return
      }
      if (current) actions.openNotification(current.threadId, current.id)
    },
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      drag.current = { id: event.pointerId, startY: event.clientY, distance: 0 }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.classList.add('is-dragging')
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag.current?.id !== event.pointerId) return
      drag.current.distance = Math.min(0, event.clientY - drag.current.startY)
      event.currentTarget.style.setProperty('--notification-drag', `${drag.current.distance}px`)
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (drag.current?.id !== event.pointerId) return
      const swiped = drag.current.distance < -DISMISS_DISTANCE
      drag.current = null
      event.currentTarget.classList.remove('is-dragging')
      event.currentTarget.style.removeProperty('--notification-drag')
      if (swiped && current) {
        wasSwiped.current = true
        actions.clearNotification(current.id)
      }
    },
  }

  return { item, mounted: presence.mounted, visible: presence.visible, buttonProps }
}
