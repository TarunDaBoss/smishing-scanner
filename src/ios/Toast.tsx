import { useToast } from '../shared/useToast'

export function Toast() {
  const { toast, holdProps, undo } = useToast()

  return (
    <div className="ios-toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="ios-toast" key={toast.id} {...holdProps}>
          <span>{toast.text}</span>
          {toast.canUndo && (
            <button type="button" className="ios-toast-undo tap" onClick={undo} aria-label="Undo report and delete">
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
