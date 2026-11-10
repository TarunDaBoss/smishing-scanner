import { useRef } from 'react'
import type { PointerEvent, RefObject } from 'react'

const DISMISS_DISTANCE = 110

/** Dragging a sheet's header downward dismisses it. */
export function useSheetDrag(sheetRef: RefObject<HTMLElement | null>, onDismiss: () => void) {
  const drag = useRef<{ id: number; startY: number; distance: number } | null>(null)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    drag.current = { id: event.pointerId, startY: event.clientY, distance: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    sheetRef.current?.classList.add('is-dragging')
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== event.pointerId) return
    drag.current.distance = Math.max(0, event.clientY - drag.current.startY)
    sheetRef.current?.style.setProperty('--sheet-drag', `${drag.current.distance}px`)
  }

  const onPointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== event.pointerId) return
    const shouldClose = drag.current.distance > DISMISS_DISTANCE
    drag.current = null
    sheetRef.current?.classList.remove('is-dragging')
    sheetRef.current?.style.removeProperty('--sheet-drag')
    if (shouldClose) onDismiss()
  }

  return { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd }
}
