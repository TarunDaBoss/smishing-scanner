import type { FormEvent } from 'react'
import { useApp } from '../core/store'

/** The message being typed. It lives in shared state, so it survives switching phones. */
export function useComposer(threadId: string) {
  const { state, actions } = useApp()
  const text = state.drafts[threadId] ?? ''
  const ready = text.trim().length > 0

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (ready) actions.sendMessage(threadId, text.trim())
  }

  return { text, ready, onSubmit, setText: (value: string) => actions.setDraft(threadId, value) }
}
