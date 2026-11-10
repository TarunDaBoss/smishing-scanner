import { useEffect, useState } from 'react'
import { useApp } from '../core/store'

const TOAST_MS = 8000

/** The current toast. It waits while the pointer or keyboard is on it, so Undo stays reachable. */
export function useToast() {
  const { state, actions } = useApp()
  const toast = state.toast
  // Tied to one toast: a toast that vanishes under the pointer never gets a "leave" event.
  const [heldId, setHeldId] = useState<number | null>(null)
  const held = toast !== null && heldId === toast.id

  useEffect(() => {
    if (!toast || held) return
    const timer = window.setTimeout(() => actions.clearToast(toast.id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast, held, actions])

  const holdProps = {
    onPointerEnter: () => setHeldId(toast?.id ?? null),
    onPointerLeave: () => setHeldId(null),
    onFocus: () => setHeldId(toast?.id ?? null),
    onBlur: () => setHeldId(null),
  }

  return { toast, holdProps, undo: actions.undoDelete }
}
