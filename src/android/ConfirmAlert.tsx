import { useRef } from 'react'
import { useApp } from '../core/store'
import type { Thread } from '../core/types'
import { useDialogFocus } from '../core/ui'

/** One UI places its dialogs near the bottom of the screen, within thumb reach. */
export function ConfirmAlert({ thread }: { thread: Thread }) {
  const { actions } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useDialogFocus(ref, actions.cancelBlock)

  return (
    <div className="android-alert-scrim">
      <div ref={ref} className="android-alert" role="alertdialog" aria-modal="true" aria-labelledby="android-alert-title" aria-describedby="android-alert-text" tabIndex={-1}>
        <h2 id="android-alert-title">Block this number?</h2>
        <p id="android-alert-text">{thread.name} won’t be able to call or text you.</p>
        <div className="android-alert-buttons">
          <button type="button" className="android-alert-button" onClick={actions.cancelBlock} data-autofocus>Cancel</button>
          <span className="android-alert-divider" aria-hidden="true" />
          <button type="button" className="android-alert-button android-alert-destructive" onClick={actions.confirmBlock}>Block</button>
        </div>
      </div>
    </div>
  )
}
