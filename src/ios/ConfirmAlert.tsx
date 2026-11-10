import { useRef } from 'react'
import { useApp } from '../core/store'
import type { Thread } from '../core/types'
import { useDialogFocus } from '../core/ui'

export function ConfirmAlert({ thread }: { thread: Thread }) {
  const { actions } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useDialogFocus(ref, actions.cancelBlock)

  return (
    <div className="ios-alert-scrim">
      <div ref={ref} className="ios-alert glass" role="alertdialog" aria-modal="true" aria-labelledby="ios-alert-title" aria-describedby="ios-alert-text" tabIndex={-1}>
        <h2 id="ios-alert-title">Block this number?</h2>
        <p id="ios-alert-text">{thread.name} won’t be able to call or text you.</p>
        <div className="ios-alert-buttons">
          <button type="button" className="ios-alert-button" onClick={actions.cancelBlock} data-autofocus>Cancel</button>
          <button type="button" className="ios-alert-button ios-alert-destructive" onClick={actions.confirmBlock}>Block</button>
        </div>
      </div>
    </div>
  )
}
