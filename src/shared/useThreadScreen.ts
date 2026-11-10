import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { threadRisk, useApp } from '../core/store'
import type { Message, Thread } from '../core/types'
import { focusIsOnPlatformSwitch } from '../core/ui'

export function useThreadScreen(thread: Thread) {
  const { actions } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const risk = threadRisk(thread)
  const riskyMessage = risk ? thread.messages.find((message) => message.detection === risk) : undefined
  const hasWarning = thread.messages.some((message) => message.detection && message.detection.level !== 'none')

  useEffect(() => {
    if (!focusIsOnPlatformSwitch()) backRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const scroller = scrollRef.current
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  }, [thread.messages.length, thread.markedSafe, thread.blocked])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') actions.back()
  }

  const isFlagged = (message: Message) => !thread.markedSafe && message.detection !== null && message.detection.level !== 'none'

  return { risk, riskyMessage, hasWarning, scrollRef, backRef, onKeyDown, isFlagged }
}
