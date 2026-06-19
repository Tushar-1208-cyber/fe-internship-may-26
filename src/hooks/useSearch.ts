import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'
import { useDebounce } from './useDebounce'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('q') ?? ''
  })
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)
  const requestIdRef = useRef(0)

  // Persist query in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    window.history.replaceState({}, '', `${window.location.pathname}${query ? '?' + params.toString() : ''}`)
  }, [query])

  // Search effect
  useEffect(() => {
    const currentId = ++requestIdRef.current

    setIsLoading(true)
    setError(null)

    searchItems(debouncedQuery)
      .then(data => {
        if (currentId === requestIdRef.current) {
          setResults(data)
        }
      })
      .catch(err => {
        if (currentId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      })
      .finally(() => {
        if (currentId === requestIdRef.current) {
          setIsLoading(false)
        }
      })
  }, [debouncedQuery])

  return { query, setQuery, results, isLoading, error }
}