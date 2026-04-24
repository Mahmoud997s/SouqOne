'use client'

import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'
import type { ActiveFilters } from '../types/filters.types'
import type { ListingCategory } from '../types/category.types'
import { parseUrlFilters } from '../utils/filter-helpers'
import { FILTERS_CONFIG } from '../config/filters.config'

interface UseFilterStateReturn {
  filters: ActiveFilters
  setFilter: (key: string, value: string | string[] | boolean | null) => void
  clearAll: () => void
  activeCount: number
  hasActiveFilters: boolean
}

export function useFilterState(category: ListingCategory): UseFilterStateReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const config = FILTERS_CONFIG[category]

  const filters = useMemo(
    () => parseUrlFilters(searchParams, config),
    [searchParams, config],
  )

  const setFilter = useCallback(
    (key: string, value: string | string[] | boolean | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '' || value === false) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router],
  )

  const clearAll = useCallback(() => {
    router.push(pathname)
  }, [pathname, router])

  const activeCount = Object.keys(filters).length
  const hasActiveFilters = activeCount > 0

  return { filters, setFilter, clearAll, activeCount, hasActiveFilters }
}
