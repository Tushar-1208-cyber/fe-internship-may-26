import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestIdRef = useRef(0)

  useEffect(() => {
    const timerId = setTimeout(async () => {
      const currentId = ++requestIdRef.current

      setIsLoading(true)
      setError(null)

      try {
        const data = await searchItems(query)

        if (currentId === requestIdRef.current) {
          setResults(data)
        }
      } catch (err) {
        if (currentId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (currentId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => clearTimeout(timerId)
  }, [query])

  return { query, setQuery, results, isLoading, error }
}