import { createContext, useContext } from 'react'
import { LEVEL_RANK } from './detection'
import type { Detection } from './detection'
import type { LinkAnalysis } from './linkCheck'
import { createThreads } from './seed'
import type { AppState, Message, Nav, Platform, Thread } from './types'

export type Action =
  | { type: 'set-platform'; platform: Platform }
  | { type: 'nav'; nav: Nav }
  | { type: 'send'; threadId: string; message: Message }
  | { type: 'delete-thread'; threadId: string }
  | { type: 'restore-deleted' }
  | { type: 'clear-toast'; id: number }
  | { type: 'ask-block'; threadId: string }
  | { type: 'cancel-block' }
  | { type: 'confirm-block' }
  | { type: 'set-safe'; threadId: string; safe: boolean }
  | { type: 'scan-start'; messageId: string }
  | { type: 'scan-done'; messageId: string; result: LinkAnalysis }
  | { type: 'set-search'; search: string }
  | { type: 'set-draft'; threadId: string; text: string }

let nextToastId = 1

export function initialState(): AppState {
  return {
    platform: 'ios',
    threads: createThreads(),
    nav: { threadId: null, sheetMessageId: null },
    scans: {},
    alertThreadId: null,
    toast: null,
    lastDeleted: null,
    search: '',
    drafts: {},
  }
}

function updateThread(state: AppState, threadId: string, change: (thread: Thread) => Thread): Thread[] {
  return state.threads.map((thread) => (thread.id === threadId ? change(thread) : thread))
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'set-platform':
      return { ...state, platform: action.platform }

    case 'nav': {
      // Browser history can point at a thread that has since been deleted.
      const exists = state.threads.some((thread) => thread.id === action.nav.threadId)
      const nav = exists ? action.nav : { threadId: null, sheetMessageId: null }
      const threads = nav.threadId ? updateThread(state, nav.threadId, (thread) => ({ ...thread, unread: false })) : state.threads
      return { ...state, nav, threads, alertThreadId: nav.sheetMessageId ? state.alertThreadId : null }
    }

    case 'send':
      return {
        ...state,
        drafts: { ...state.drafts, [action.threadId]: '' },
        threads: updateThread(state, action.threadId, (thread) => ({ ...thread, messages: [...thread.messages, action.message] })),
      }

    case 'delete-thread': {
      const index = state.threads.findIndex((thread) => thread.id === action.threadId)
      if (index < 0) return state
      return {
        ...state,
        threads: state.threads.filter((thread) => thread.id !== action.threadId),
        lastDeleted: { thread: state.threads[index], index },
        toast: { id: nextToastId++, text: 'Reported and deleted', canUndo: true },
      }
    }

    case 'restore-deleted': {
      if (!state.lastDeleted) return state
      const threads = [...state.threads]
      threads.splice(state.lastDeleted.index, 0, state.lastDeleted.thread)
      return { ...state, threads, lastDeleted: null, toast: null }
    }

    case 'clear-toast':
      return state.toast?.id === action.id ? { ...state, toast: null } : state

    case 'ask-block':
      return { ...state, alertThreadId: action.threadId }

    case 'cancel-block':
      return { ...state, alertThreadId: null }

    case 'confirm-block':
      if (!state.alertThreadId) return state
      return { ...state, alertThreadId: null, threads: updateThread(state, state.alertThreadId, (thread) => ({ ...thread, blocked: true })) }

    case 'set-safe':
      return { ...state, threads: updateThread(state, action.threadId, (thread) => ({ ...thread, markedSafe: action.safe })) }

    case 'scan-start':
      return { ...state, scans: { ...state.scans, [action.messageId]: { status: 'checking' } } }

    case 'scan-done':
      return { ...state, scans: { ...state.scans, [action.messageId]: { status: 'done', result: action.result } } }

    case 'set-search':
      return { ...state, search: action.search }

    case 'set-draft':
      return { ...state, drafts: { ...state.drafts, [action.threadId]: action.text } }
  }
}

/** The most serious active warning in a thread, or null when there is nothing to show. */
export function threadRisk(thread: Thread): Detection | null {
  if (thread.markedSafe) return null
  let worst: Detection | null = null
  for (const message of thread.messages) {
    const detection = message.detection
    if (!detection || detection.level === 'none') continue
    if (!worst || LEVEL_RANK[detection.level] > LEVEL_RANK[worst.level]) worst = detection
  }
  return worst
}

export function lastMessage(thread: Thread): Message {
  return thread.messages[thread.messages.length - 1]
}

export function threadsByRecency(threads: Thread[]): Thread[] {
  return [...threads].sort((a, b) => lastMessage(b).at - lastMessage(a).at)
}

export interface AppActions {
  setPlatform: (platform: Platform) => void
  openThread: (threadId: string) => void
  openSheet: (messageId: string) => void
  back: () => void
  sendMessage: (threadId: string, text: string) => void
  reportAndDelete: (threadId: string) => void
  undoDelete: () => void
  clearToast: (id: number) => void
  askBlock: (threadId: string) => void
  cancelBlock: () => void
  confirmBlock: () => void
  markSafe: (threadId: string) => void
  undoSafe: (threadId: string) => void
  scanLink: (messageId: string, link: LinkAnalysis) => void
  setSearch: (search: string) => void
  setDraft: (threadId: string, text: string) => void
}

export interface AppContextValue {
  state: AppState
  actions: AppActions
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
