'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import { MapPin, Heart, MessageCircle, Phone, BadgeCheck, Tag as TagIcon, Star } from 'lucide-react'
import { clsx } from 'clsx'
import {
  Car, Bus, Wrench, Settings, Truck,
  Calendar, Gauge, Settings2, Users, Building2,
  CalendarDays, Route, Tag, Fuel,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFavContext } from '@/providers/favorites-provider'
import { useAuth } from '@/providers/auth-provider'
import type { UnifiedListingItem, BadgeColor } from '../types/unified-item.types'
import type { ListingCategory } from '../types/category.types'
import { formatRelativeTime } from '../utils/filter-helpers'

// ─── Icon resolver ────────────────────────────────────────────────────────────

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

const BADGE_BG: Record<BadgeColor, string> = {
  green:  'bg-emerald-500',
  blue:   'bg-blue-500',
  orange: 'bg-red-500',
  purple: 'bg-blue-600',
  gray:   'bg-slate-400',
  red:    'bg-red-500',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ListingCardProps {
  item: UnifiedListingItem
  onSave?: (id: string) => void
  isSaved?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingCard({ item }: ListingCardProps) {
  const t = useTranslations('listings')
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isFav: checkFav, toggleFav } = useFavContext()
  const entityKey = `${item.favoriteEntityType}:${item.id}`
  const serverFav = checkFav(entityKey)
  const [localFav, setLocalFav] = useState(serverFav)
  const [animating, setAnimating] = useState(false)

  useEffect(() => { setLocalFav(serverFav) }, [serverFav])

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) return
    setLocalFav(!localFav)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 350)
    toggleFav.mutate({ entityType: item.favoriteEntityType as any, entityId: item.id })
  }

  const CategoryIcon = CATEGORY_ICON[item.category]
  const thumbnails = item.images.length >= 3 ? item.images.slice(1, 4) : []

  return (
    <article
      onClick={() => router.push(item.href)}
      className={clsx(
        "flex bg-background border border-outline-variant/30 rounded-xl overflow-hidden",
        "cursor-pointer hover:border-red-400/50 hover:shadow-[0_2px_16px_rgba(0,0,0,0.09)]",
        "transition-all duration-200 group"
      )}
    >
      {/* ── Image Section (RIGHT in RTL = first in DOM) ── */}
      <div className="relative flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] flex flex-col bg-surface-container">

        {/* Main image */}
        <div className="relative flex-1 min-h-[140px] sm:min-h-[165px] overflow-hidden">
          {item.images[0] ? (
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
              <CategoryIcon size={32} className="text-on-surface-variant/20" />
            </div>
          )}

          {/* Featured badge — top start (right in RTL) */}
          {item.primaryBadge && (
            <span className="absolute top-0 start-0 flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[11px] font-bold rounded-ee-xl">
              <Star size={10} className="fill-white" />
              {item.primaryBadge.label}
            </span>
          )}

          {/* Save button — top end (left in RTL) */}
          {isAuthenticated && (
            <button
              onClick={handleFav}
              aria-label={localFav ? t('removeFromFavorites') : t('addToFavorites')}
              className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Heart size={13} className={`transition-all duration-200 ${localFav ? 'fill-red-500 text-red-500' : 'text-slate-400'} ${animating ? 'animate-[heartPop_0.35s_ease-out]' : ''}`} />
            </button>
          )}
        </div>

        {/* Thumbnails strip */}
        {thumbnails.length > 0 && (
          <div className="flex h-[50px] border-t border-outline-variant/20 flex-shrink-0">
            {thumbnails.map((src, i) => {
              const isLast = i === thumbnails.length - 1
              const remaining = item.images.length - 4
              const showOverlay = isLast && remaining > 0
              return (
                <div key={i} className="relative w-1/3 flex-shrink-0 overflow-hidden border-s border-outline-variant/20 first:border-s-0">
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-[11px] font-bold">+{remaining}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Content Section (LEFT in RTL = second in DOM) ── */}
      <div className="flex-1 min-w-0 flex flex-col p-3.5 gap-2 overflow-hidden">

        {/* Price + condition badge */}
        <div className="flex items-start justify-between gap-2">
          {item.price && item.price > 0 ? (
            <p className="text-[20px] font-black text-red-500 leading-none">
              {item.price.toLocaleString('en-US')}
              <span className="text-[11px] font-normal text-on-surface-variant mr-1.5">
                {item.currency === 'OMR' ? t('currencyUnit') : item.currency}
                {item.priceLabel && ` / ${item.priceLabel}`}
              </span>
            </p>
          ) : (
            <p className="text-[14px] font-semibold text-on-surface-variant">{t('contactForPrice')}</p>
          )}
          {item.secondaryBadge && (
            <span className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0',
              BADGE_BG[item.secondaryBadge.color]
            )}>
              {item.secondaryBadge.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-[13px] font-semibold text-on-surface line-clamp-1 leading-snug">
          {item.title}
        </h2>

        {/* Detail chips — pill style */}
        {item.details.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.details.slice(0, 5).map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-[11px]"
              >
                <span className="text-on-surface-variant/60"><DetailIcon name={d.icon} size={10} /></span>
                <span className="font-semibold text-on-surface text-[11px]">{d.value}</span>
              </span>
            ))}
          </div>
        )}

        {/* Trust capsules */}
        {(item.sellerVerified || item.isPriceNegotiable) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.sellerVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200/70 text-[10px] font-semibold text-sky-700">
                <BadgeCheck size={10} />
                {t('verified')}
              </span>
            )}
            {item.isPriceNegotiable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-[10px] font-semibold text-amber-700">
                <TagIcon size={10} />
                {t('negotiable')}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Divider */}
        <hr className="border-outline-variant/20" />

        {/* Location + time */}
        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
          <MapPin size={11} className="text-on-surface-variant/50 flex-shrink-0" />
          <span className="truncate">{item.governorate ?? t('unknownLocation')}</span>
          <span className="mx-1 text-outline-variant/40">·</span>
          <span className="flex-shrink-0 text-[10px] text-on-surface-variant/50">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.phoneNumber && (
            <a
              href={`tel:${item.phoneNumber}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-[12px] font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
            >
              <Phone size={13} />
              {t('call')}
            </a>
          )}
          <a
            href={`/messages?listing=${item.id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-[12px] font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <MessageCircle size={13} />
            {t('chat')}
          </a>
          {(item.whatsappNumber ?? item.phoneNumber) && (
            <a
              href={`https://wa.me/${(item.whatsappNumber ?? item.phoneNumber)?.replace(/\D/g, '')}`}
              onClick={e => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.842L.057 23.854a.5.5 0 0 0 .61.61l6.012-1.453A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.563 9.563 0 0 1-4.861-1.327l-.348-.207-3.613.873.888-3.524-.227-.362A9.565 9.565 0 0 1 2.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/>
              </svg>
              {t('whatsapp')}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
