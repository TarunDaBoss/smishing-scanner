import { useEffect, useState } from 'react'
import { useApp } from '../core/store'

const TOAST_MS = 8000

export function Toast() {
  const { state, actions } = useApp()
  const [held, setHeld] = useState(false)
  const toast = state.toast

  useEffect(() => {
    if (!toast || held) return
    const timer = window.setTimeout(() => actions.clearToast(toast.id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast, held, actions])

  return (
    <div className="ios-toast-region" role="status" aria-live="polite">
      {toast && (
        <div
          className="ios-toast"
          key={toast.id}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <span>{toast.text}</span>
          {toast.canUndo && (
            <button type="button" className="ios-toast-undo tap" onClick={actions.undoDelete} aria-label="Undo report and delete">
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
