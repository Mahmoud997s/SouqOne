'use client'

import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import { MapPin, Heart } from 'lucide-react'
import {
  Car, Bus, Wrench, Settings, Truck,
  Calendar, Gauge, Settings2, Users, Building2,
  CalendarDays, Route, Tag, Fuel,
} from 'lucide-react'
import type { UnifiedListingItem } from '../types/unified-item.types'
import type { ListingCategory } from '../types/category.types'

//  Icon resolver 

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>

const ICON_MAP: Record<string, LucideIcon> = {
  Car, Bus, Wrench, Settings, Truck,
  Calendar, Gauge, Settings2, Users, Building2,
  CalendarDays, Route, Tag, Fuel, MapPin,
}

const CATEGORY_ICON: Record<ListingCategory, LucideIcon> = {
  cars:      Car,
  buses:     Bus,
  equipment: Wrench,
  parts:     Settings,
  services:  Wrench,
}

function DetailIcon({ name, size = 11 }: { name: string; size?: number }) {
  const Comp = ICON_MAP[name]
  if (!Comp) return null
  return <Comp size={size} />
}

// Badge dot colors
const BADGE_DOT: Record<string, string> = {
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  gray:   'bg-gray-400',
  red:    'bg-red-500',
  amber:  'bg-amber-500',
}

//  Props 

interface UnifiedCardProps {
  item: UnifiedListingItem
  onSave?: (id: string) => void
  isSaved?: boolean
}

//  Component 

export function UnifiedCard({ item, onSave, isSaved = false }: UnifiedCardProps) {
  const router = useRouter()
  const CategoryIcon = CATEGORY_ICON[item.category]
  const visibleDetails = item.details.slice(0, 3)

  return (
    <div
      onClick={() => router.push(item.href)}
      className="group rounded-xl overflow-hidden bg-background border border-outline-variant/20 hover:border-outline-variant/40 hover:shadow-md hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-surface-container" style={{ aspectRatio: '16/10' }}>
        {item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            priority={false}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
            <CategoryIcon size={28} className="text-on-surface-variant/25" />
          </div>
        )}

        {/* Primary badge (top-right) - listing type */}
        {item.primaryBadge && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2
                           inline-flex items-center gap-0.5 sm:gap-1
                           px-1 sm:px-2 py-px sm:py-0.5 rounded
                           bg-black/55 backdrop-blur-sm
                           text-white text-[7px] sm:text-[10px] font-bold
                           select-none">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              BADGE_DOT[item.primaryBadge.color] ?? 'bg-gray-400'
            }`} />
            {item.primaryBadge.label}
          </span>
        )}

        {/* Secondary badge (top-left) - condition */}
        {item.secondaryBadge && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2
                           inline-flex items-center gap-0.5 sm:gap-1
                           px-1 sm:px-2 py-px sm:py-0.5 rounded
                           bg-black/55 backdrop-blur-sm
                           text-white text-[7px] sm:text-[10px] font-bold
                           select-none">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              BADGE_DOT[item.secondaryBadge.color] ?? 'bg-gray-400'
            }`} />
            {item.secondaryBadge.label}
          </span>
        )}

        {/* Save button (top-left, visible on hover) */}
        {onSave && (
          <button
            onClick={e => { e.stopPropagation(); onSave(item.id) }}
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-150"
            aria-label={isSaved ? 'إزالة من المحفوظات' : 'حفظ'}
          >
            <Heart
              size={14}
              className={isSaved ? 'fill-red-500 text-red-500' : 'text-on-surface/70'}
            />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-[13px] font-medium text-on-surface line-clamp-1 mb-1.5">
          {item.title}
        </h3>

        {/* Details */}
        {visibleDetails.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {visibleDetails.map((detail, i) => (
              <span key={i} className="flex items-center gap-0.5 text-[11px] text-on-surface-variant">
                {i > 0 && <span className="text-outline-variant mr-1">·</span>}
                <DetailIcon name={detail.icon} size={10} />
                {detail.value}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={10} className="text-on-surface-variant/40 flex-shrink-0" />
          <span className="text-[11px] text-on-surface-variant/70 truncate">
            {item.governorate ?? 'غير محدد'}
          </span>
        </div>

        {/* Divider */}
        <hr className="border-outline-variant/20 mb-2" />

        {/* Price row */}
        <div className="flex items-center justify-between">
          {/* Price */}
          {item.price && item.price > 0 ? (
            <span className="text-[14px] font-semibold text-on-surface">
              {item.primaryBadge?.label === 'مطلوب' ? (
                <>
                  <span className="text-[13px] font-medium text-foreground">الميزانية: </span>
                  {item.price.toLocaleString('en-US')}
                  <span className="text-[11px] font-normal text-on-surface-variant mr-0.5">
                    {item.currency === 'OMR' ? ' ر.ع' : ` ${item.currency}`}
                  </span>
                </>
              ) : (
                <>
                  {item.price.toLocaleString('en-US')}
                  <span className="text-[11px] font-normal text-on-surface-variant mr-0.5">
                    {item.currency === 'OMR' ? ' ر.ع' : ` ${item.currency}`}
                    {item.priceLabel && ` / ${item.priceLabel}`}
                  </span>
                </>
              )}
            </span>
          ) : (
            <span className="text-[12px] text-on-surface-variant">
              تواصل للسعر
            </span>
          )}

        </div>
      </div>
    </div>
  )
}