import { useEffect, useState } from 'react'
import { useApp } from '../core/store'

const TOAST_MS = 8000

/** The current toast. It waits while the pointer or keyboard is on it, so Undo stays reachable. */
export function useToast() {
  const { state, actions } = useApp()
  const [held, setHeld] = useState(false)
  const toast = state.toast

  useEffect(() => {
    if (!toast || held) return
    const timer = window.setTimeout(() => actions.clearToast(toast.id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast, held, actions])

  const holdProps = {
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  }

  return { toast, holdProps, undo: actions.undoDelete }
}
