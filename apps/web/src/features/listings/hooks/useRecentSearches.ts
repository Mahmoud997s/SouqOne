'use client'

import { useState, useEffect, useCallback } from 'react'

const MAX_RECENT_SEARCHES = 5
const STORAGE_KEY = 'carone_recent_searches'

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to parse recent searches', e)
    }
  }, [])

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return

    setRecentSearches(prev => {
      // Remove if it already exists to put it at the top
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase())
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save recent searches', e)
      }
      
      return updated
    })
  }, [])

  const removeSearch = useCallback((term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== term)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save recent searches', e)
      }
      return updated
    })
  }, [])

  const clearSearches = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear recent searches', e)
    }
  }, [])

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches
  }
}
