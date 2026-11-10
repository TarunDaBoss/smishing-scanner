import type { Detection } from './detection'
import type { LinkAnalysis } from './linkCheck'

export type Platform = 'ios' | 'android'

export interface Message {
  id: string
  direction: 'in' | 'out'
  text: string
  at: number
  /** Null for messages the visitor sent. */
  detection: Detection | null
}

export interface Thread {
  id: string
  name: string
  isContact: boolean
  /** Monogram background for contacts. */
  tint?: string
  messages: Message[]
  unread: boolean
  markedSafe: boolean
  blocked: boolean
}

export interface Nav {
  threadId: string | null
  sheetMessageId: string | null
}

export type ScanState = { status: 'checking' } | { status: 'done'; result: LinkAnalysis }

export interface Toast {
  id: number
  text: string
  canUndo: boolean
}

export interface DeletedThread {
  thread: Thread
  index: number
}

export interface AppState {
  platform: Platform
  threads: Thread[]
  nav: Nav
  scans: Record<string, ScanState>
  alertThreadId: string | null
  toast: Toast | null
  lastDeleted: DeletedThread | null
}
