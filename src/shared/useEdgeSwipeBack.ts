import { useEffect } from 'react'
import type { RefObject } from 'react'

const EDGE_WIDTH = 28
const COMMIT_VELOCITY = 0.55 // pixels per millisecond

interface Options {
  /** Android's back gesture works from either side. iPhone's is left only. */
  bothEdges: boolean
  /** How far across the screen, from 0 to 1, a drag must go to count. */
  commitDistance: number
}

/** Dragging in from the screen edge goes back, following the finger. */
export function useEdgeSwipeBack(ref: RefObject<HTMLElement | null>, enabled: boolean, onBack: () => void, { bothEdges, commitDistance }: Options) {
  useEffect(() => {
    const nav = ref.current
    if (!nav || !enabled) return

    let pointer: number | null = null
    let startX = 0
    let width = 1
    let lastX = 0
    let lastTime = 0
    let velocity = 0
    let direction = 1

    const onDown = (event: PointerEvent) => {
      const rect = nav.getBoundingClientRect()
      const fromLeft = event.clientX - rect.left <= EDGE_WIDTH
      const fromRight = bothEdges && rect.right - event.clientX <= EDGE_WIDTH
      if (!fromLeft && !fromRight) return
      direction = fromLeft ? 1 : -1
      nav.dataset.edge = fromLeft ? 'left' : 'right'
      pointer = event.pointerId
      startX = lastX = event.clientX
      lastTime = event.timeStamp
      velocity = 0
      width = rect.width
      nav.setPointerCapture(pointer)
      nav.classList.add('is-swiping')
      nav.style.setProperty('--swipe', '0')
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return
      const elapsed = event.timeStamp - lastTime
      if (elapsed > 0) velocity = (direction * (event.clientX - lastX)) / elapsed
      lastX = event.clientX
      lastTime = event.timeStamp
      const progress = Math.max(0, Math.min(1, (direction * (event.clientX - startX)) / width))
      nav.style.setProperty('--swipe', String(progress))
    }

    const finish = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return
      pointer = null
      const progress = Number(nav.style.getPropertyValue('--swipe')) || 0
      const commit = event.type === 'pointerup' && (progress > commitDistance || velocity > COMMIT_VELOCITY)
      nav.classList.remove('is-swiping')
      nav.style.removeProperty('--swipe')
      if (commit) {
        // The thread slides the rest of the way from where the finger let go.
        nav.dataset.closing = 'true'
        window.setTimeout(() => delete nav.dataset.closing, 500)
        onBack()
      }
    }

    nav.addEventListener('pointerdown', onDown)
    nav.addEventListener('pointermove', onMove)
    nav.addEventListener('pointerup', finish)
    nav.addEventListener('pointercancel', finish)
    return () => {
      nav.removeEventListener('pointerdown', onDown)
      nav.removeEventListener('pointermove', onMove)
      nav.removeEventListener('pointerup', finish)
      nav.removeEventListener('pointercancel', finish)
    }
  }, [ref, enabled, onBack, bothEdges, commitDistance])
}
