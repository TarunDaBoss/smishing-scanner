import { useMemo, useState } from 'react'
import { threadsByRecency, useApp } from '../core/store'
import { ConversationRow } from './ConversationRow'

export function ConversationList() {
  const { state } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')

  const threads = useMemo(() => {
    const sorted = threadsByRecency(state.threads)
    const term = query.trim().toLowerCase()
    if (!term) return sorted
    return sorted.filter((thread) => thread.name.toLowerCase().includes(term) || thread.messages.some((message) => message.text.toLowerCase().includes(term)))
  }, [state.threads, query])

  return (
    <div className="ios-list">
      <div className="ios-list-bar" data-show={collapsed} aria-hidden="true">Messages</div>
      <div className="ios-list-scroll" onScroll={(event) => setCollapsed(event.currentTarget.scrollTop > 34)}>
        <h2 className="ios-large-title">Messages</h2>
        {threads.length > 0 ? (
          <ul className="ios-rows">
            {threads.map((thread) => <ConversationRow key={thread.id} thread={thread} />)}
          </ul>
        ) : (
          <p className="ios-empty">{query ? 'No results' : 'No conversations'}</p>
        )}
      </div>
      <div className="ios-search-wrap">
        <label className="ios-search glass">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.8" stroke="currentColor" strokeWidth="2.3" />
            <path d="m15.8 15.8 5 5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Search messages</span>
          <input type="search" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
    </div>
  )
}
