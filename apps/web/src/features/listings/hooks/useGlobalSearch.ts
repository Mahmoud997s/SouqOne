'use client'

import { useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearch, type SearchHit } from '@/lib/api/search'
import { resolveLocationLabel } from '@/lib/location-data'
import { getImageUrl } from '@/lib/image-utils'
import type { ActiveFilters } from '../types/filters.types'
import type { UnifiedListingItem } from '../types/unified-item.types'
import type { ListingCategory } from '../types/category.types'
import { ENTITY_TYPE_TO_CATEGORY, type GlobalEntityType } from '../config/global-filters.config'

interface UseGlobalSearchReturn {
  items:      UnifiedListingItem[]
  total:      number
  totalPages: number
  isLoading:  boolean
  isFetching: boolean
  error:      Error | null
  page:       number
}

interface UseGlobalSearchOptions {
  /** Search query — if empty, returns no results unless `entityType` is set */
  q?: string
  /** Restrict to a single entity type (used by tabs) */
  entityType?: GlobalEntityType | ''
  /** Active filters from URL (governorate, priceMin, priceMax) */
  filters?: ActiveFilters
  /** 1-based page */
  page?: number
}

// ─── Hit → Unified mapper ─────────────────────────────────────────────────────

function hitToUnified(hit: SearchHit, locale: string): UnifiedListingItem {
  const entityType = (hit._entityType ?? '').toLowerCase() as GlobalEntityType
  const category: ListingCategory =
    (ENTITY_TYPE_TO_CATEGORY as Record<string, ListingCategory>)[entityType] ?? 'cars'

  const price = (hit.price ?? hit.basePrice ?? hit.priceFrom ?? null) as number | null
  const image = hit.imageUrl ? getImageUrl(hit.imageUrl) ?? null : null

  // Choose href based on category
  const href: string = (() => {
    switch (category) {
      case 'cars':     return `/sale/car/${hit.id}`
      case 'buses':    return `/sale/bus/${hit.id}`
      case 'parts':    return `/sale/part/${hit.id}`
      case 'services': return `/sale/service/${hit.id}`
      case 'jobs':     return `/jobs/${hit.slug || hit.id}`
      default:         return `/sale/car/${hit.id}`
    }
  })()

  // Favorite entity type maps
  const favoriteMap: Record<string, string> = {
    cars:     'LISTING',
    buses:    'BUS_LISTING',
    parts:    'SPARE_PART',
    services: 'CAR_SERVICE',
    jobs:     'JOB',
  }

  return {
    id:                  hit.id,
    category,
    title:               hit.title,
    price:               price && Number(price) > 0 ? Number(price) : null,
    priceLabel:          null,
    currency:            hit.currency || 'OMR',
    images:              image ? [image] : [],
    governorate:         hit.governorate ?? null,
    createdAt:           typeof hit.createdAt === 'string' ? hit.createdAt : new Date(Number(hit.createdAt) || Date.now()).toISOString(),
    primaryBadge:        null,
    secondaryBadge:      null,
    details:             [],
    href,
    favoriteEntityType:  favoriteMap[category] ?? 'LISTING',
    attributes: {
      slug:        hit.slug,
      make:        hit.make,
      model:       hit.model,
      year:        hit.year,
      condition:   hit.condition,
      city:        hit.city,
      _entityType: hit._entityType,
      _resolvedLocation: hit.governorate ? resolveLocationLabel(hit.governorate, locale) : undefined,
    },
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGlobalSearch({
  q,
  entityType,
  filters = {},
  page = 1,
}: UseGlobalSearchOptions): UseGlobalSearchReturn {
  // We're inside next-intl context; useLocale just to ensure consistent locale resolution
  const _t = useTranslations('listings')
  const locale = useLocale()
  void _t

  const governorate = (filters.governorate as string) || undefined
  const priceRange = filters['priceMin_priceMax'] as string | undefined
  const [pmin, pmax] = priceRange ? priceRange.split('|') : []

  const sort = (filters.sort as string) || ''
  const sortBy = sort === 'price:asc' ? 'price:asc'
    : sort === 'price:desc' ? 'price:desc'
    : sort === 'newest' ? 'newest'
    : undefined

  const query = useSearch(
    {
      q:          q || undefined,
      entityType: entityType || undefined,
      governorate,
      minPrice:   pmin ? Number(pmin) : undefined,
      maxPrice:   pmax ? Number(pmax) : undefined,
      sortBy,
      page,
      limit:      24,
    },
    Boolean(q || entityType || governorate),
  )

  const items = useMemo<UnifiedListingItem[]>(() => {
    const list = query.data?.items ?? []
    return list.map((hit) => hitToUnified(hit, locale))
  }, [query.data, locale])

  return {
    items,
    total:      query.data?.meta?.total      ?? 0,
    totalPages: query.data?.meta?.totalPages ?? 0,
    isLoading:  query.isLoading,
    isFetching: query.isFetching,
    error:      query.error as Error | null,
    page,
  }
}
