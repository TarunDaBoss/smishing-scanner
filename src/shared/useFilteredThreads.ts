import { useMemo } from 'react'
import { threadsByRecency, useApp } from '../core/store'

export function useFilteredThreads() {
  const { state, actions } = useApp()
  const query = state.search

  const threads = useMemo(() => {
    const sorted = threadsByRecency(state.threads)
    const term = query.trim().toLowerCase()
    if (!term) return sorted
    return sorted.filter((thread) => thread.name.toLowerCase().includes(term) || thread.messages.some((message) => message.text.toLowerCase().includes(term)))
  }, [state.threads, query])

  return { threads, query, setQuery: actions.setSearch }
}
