import { useState } from 'react'
import { useApp } from '../core/store'
import { useFilteredThreads } from '../shared/useFilteredThreads'
import { ConversationRow } from './ConversationRow'

export function ConversationList() {
  const { state } = useApp()
  const { threads, query, setQuery } = useFilteredThreads()
  const [collapsed, setCollapsed] = useState(false)
  const unread = state.threads.filter((thread) => thread.unread).length

  return (
    <div className="android-list">
      <div className="android-list-bar" data-show={collapsed} aria-hidden="true">Messages</div>
      <div className="android-list-scroll" onScroll={(event) => setCollapsed(event.currentTarget.scrollTop > 96)}>
        <div className="android-hero">
          <h2 className="android-hero-title">Messages</h2>
          {unread > 0 && <p className="android-hero-sub">{unread} unread {unread === 1 ? 'message' : 'messages'}</p>}
        </div>

        <label className="android-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.8" stroke="currentColor" strokeWidth="2.2" />
            <path d="m15.8 15.8 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Search messages</span>
          <input type="search" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        {threads.length > 0 ? (
          <ul className="android-rows">
            {threads.map((thread) => <ConversationRow key={thread.id} thread={thread} />)}
          </ul>
        ) : (
          <p className="android-empty">{query ? 'No results' : 'No conversations'}</p>
        )}
      </div>
    </div>
  )
}
