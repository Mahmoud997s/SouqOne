'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useListings } from '@/lib/api/listings'
import type { ListingItem } from '@/lib/api/listings'
import { useBusListings } from '@/lib/api/buses'
import type { BusListingItem } from '@/lib/api/buses'
import { useEquipmentListings } from '@/lib/api/equipment'
import type { EquipmentListingItem } from '@/lib/api/equipment'
import { useParts } from '@/lib/api/parts'
import type { SparePartItem } from '@/lib/api/parts'
import { useCarServices } from '@/lib/api/services'
import type { CarServiceItem } from '@/lib/api/services'
import { getImageUrl } from '@/lib/image-utils'

import type { ListingCategory } from '../types/category.types'
import type { UnifiedListingItem, Badge, DetailItem } from '../types/unified-item.types'
import type { ActiveFilters } from '../types/filters.types'
import { FILTERS_CONFIG } from '../config/filters.config'
import { buildQueryParams } from '../utils/filter-helpers'

// ─── Return type ─────────────────────────────────────────────────────────────

interface UseUnifiedListingsReturn {
  items: UnifiedListingItem[]
  total: number
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  page: number
  totalPages: number
}

// ─── Param builders ───────────────────────────────────────────────────────────

function toParams(filters: ActiveFilters, category: ListingCategory, page: number): Record<string, string> {
  return { ...buildQueryParams(filters, FILTERS_CONFIG[category]), page: String(page) }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof useTranslations<'listings'>>

export function useUnifiedListings(
  category: ListingCategory,
  filters: ActiveFilters,
  page = 1,
): UseUnifiedListingsReturn {
  const t = useTranslations('listings')
  const p = toParams(filters, category, page)

  const carsQuery      = useListings(p,    category === 'cars')
  const busesQuery     = useBusListings(p, category === 'buses')
  const equipmentQuery = useEquipmentListings(category === 'equipment' ? p : undefined)
  const partsQuery     = useParts(p,       category === 'parts')
  const servicesQuery  = useCarServices(p, category === 'services')

  const raw = {
    cars:      carsQuery.data,
    buses:     busesQuery.data,
    equipment: equipmentQuery.data,
    parts:     partsQuery.data,
    services:  servicesQuery.data,
  }[category]

  const isLoading = {
    cars:      carsQuery.isLoading,
    buses:     busesQuery.isLoading,
    equipment: equipmentQuery.isLoading,
    parts:     partsQuery.isLoading,
    services:  servicesQuery.isLoading,
  }[category]

  const isFetching = {
    cars:      carsQuery.isFetching,
    buses:     busesQuery.isFetching,
    equipment: equipmentQuery.isFetching,
    parts:     partsQuery.isFetching,
    services:  servicesQuery.isFetching,
  }[category]

  const error = {
    cars:      carsQuery.error,
    buses:     busesQuery.error,
    equipment: equipmentQuery.error,
    parts:     partsQuery.error,
    services:  servicesQuery.error,
  }[category] as Error | null

  const items = useMemo<UnifiedListingItem[]>(() => {
    const list = (raw as any)?.items ?? []
    return list.map((item: unknown) => transformToUnified(category, item, t))
  }, [raw, category, t])

  return {
    items,
    total:      (raw as any)?.meta?.total      ?? 0,
    totalPages: (raw as any)?.meta?.totalPages ?? 0,
    isLoading:  isLoading ?? false,
    isFetching: isFetching ?? false,
    error,
    page,
  }
}

// ─── Transformer dispatcher ───────────────────────────────────────────────────

function transformToUnified(category: ListingCategory, item: unknown, t: T): UnifiedListingItem {
  switch (category) {
    case 'cars':      return transformCar(item as ListingItem, t)
    case 'buses':     return transformBus(item as BusListingItem, t)
    case 'equipment': return transformEquipment(item as EquipmentListingItem, t)
    case 'parts':     return transformPart(item as SparePartItem, t)
    case 'services':  return transformService(item as CarServiceItem, t)
  }
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function getListingTypeBadge(type: string, t: T): Badge {
  const map: Record<string, Badge> = {
    SALE:                  { label: t('forSale'),          color: 'blue' },
    RENTAL:                { label: t('typeRental'),       color: 'green' },
    WANTED:                { label: t('wanted'),           color: 'orange' },
    BUS_SALE:              { label: t('forSale'),          color: 'blue' },
    BUS_SALE_WITH_CONTRACT:{ label: t('saleWithContract'), color: 'blue' },
    BUS_RENT:              { label: t('typeRental'),       color: 'green' },
    BUS_CONTRACT:          { label: t('contract'),         color: 'purple' },
    BUS_REQUEST:           { label: t('busRequest'),       color: 'orange' },
    EQUIPMENT_SALE:        { label: t('forSale'),          color: 'blue' },
    EQUIPMENT_RENT:        { label: t('typeRental'),       color: 'green' },
  }
  return map[type] ?? { label: type, color: 'gray' }
}

function getBusTypeBadge(busType: string, t: T): Badge {
  const map: Record<string, Badge> = {
    MINI_BUS:   { label: t('busTypeMiniBus'),    color: 'gray' },
    MEDIUM_BUS: { label: t('busTypeMediumBus'),  color: 'gray' },
    LARGE_BUS:  { label: t('busTypeLargeBus'),   color: 'gray' },
    COASTER:    { label: t('busTypeCoaster'),    color: 'gray' },
    SCHOOL_BUS: { label: t('busTypeSchoolBus'),  color: 'gray' },
  }
  return map[busType] ?? { label: busType, color: 'gray' }
}

function getConditionBadge(condition: string, t: T): Badge {
  const map: Record<string, Badge> = {
    NEW:         { label: t('new'),                  color: 'green' },
    USED:        { label: t('conditionUsed'),        color: 'blue' },
    LIKE_NEW:    { label: t('conditionLikeNew'),     color: 'blue' },
    GOOD:        { label: t('conditionGood'),        color: 'blue' },
    FAIR:        { label: t('conditionFair'),        color: 'orange' },
    POOR:        { label: t('conditionPoor'),        color: 'red' },
    REFURBISHED: { label: t('conditionRefurbished'), color: 'orange' },
  }
  return map[condition] ?? { label: condition, color: 'gray' }
}

function imgs(images?: { url: string }[]): string[] {
  return (images ?? []).map(i => getImageUrl(i.url) ?? '').filter(Boolean)
}

function translateTransmission(v: string, t: T): string {
  const map: Record<string, string> = {
    AUTOMATIC: t('transmissionAutomatic'),
    MANUAL:    t('transmissionManual'),
  }
  return map[v] ?? v
}

function translateFuel(v: string, t: T): string {
  const map: Record<string, string> = {
    PETROL:   t('fuelPetrol'),
    DIESEL:   t('fuelDiesel'),
    HYBRID:   t('fuelHybrid'),
    ELECTRIC: t('fuelElectric'),
  }
  return map[v] ?? v
}

function translateBody(v: string, t: T): string {
  const map: Record<string, string> = {
    SEDAN:       t('bodySedan'),
    SUV:         t('bodySUV'),
    HATCHBACK:   t('bodyHatchback'),
    COUPE:       t('bodyCoupe'),
    PICKUP:      t('bodyPickup'),
    VAN:         t('bodyVan'),
    CONVERTIBLE: t('bodyConvertible'),
    WAGON:       t('bodyWagon'),
    TRUCK:       t('bodyTruck'),
  }
  return map[v] ?? v
}

function translateServiceType(v: string, t: T): string {
  const map: Record<string, string> = {
    MAINTENANCE:          t('svcMaintenance'),
    CLEANING:             t('svcCleaning'),
    MODIFICATION:         t('svcModification'),
    INSPECTION:           t('svcInspection'),
    BODYWORK:             t('svcBodywork'),
    ACCESSORIES_INSTALL:  t('svcAccessories'),
    KEYS_LOCKS:           t('svcKeysLocks'),
    TOWING:               t('svcTowing'),
    OTHER_SERVICE:        t('svcOther'),
  }
  return map[v] ?? v
}

function translateProvider(v: string, t: T): string {
  const map: Record<string, string> = {
    WORKSHOP:   t('providerWorkshop'),
    INDIVIDUAL: t('providerIndividual'),
    MOBILE:     t('providerMobile'),
    COMPANY:    t('providerCompany'),
  }
  return map[v] ?? v
}

function translatePartCategory(v: string, t: T): string {
  const map: Record<string, string> = {
    ENGINE:      t('partCatEngine'),
    BODY:        t('partCatBody'),
    ELECTRICAL:  t('partCatElectrical'),
    SUSPENSION:  t('partCatSuspension'),
    BRAKES:      t('partCatBrakes'),
    INTERIOR:    t('partCatInterior'),
    TIRES:       t('partCatTires'),
    BATTERIES:   t('partCatBatteries'),
    OILS:        t('partCatOils'),
    ACCESSORIES: t('partCatAccessories'),
    OTHER:       t('partCatOther'),
  }
  return map[v] ?? v
}

function translateEquipmentType(v: string, t: T): string {
  const map: Record<string, string> = {
    EXCAVATOR:       t('equipTypeExcavator'),
    CRANE:           t('equipTypeCrane'),
    LOADER:          t('equipTypeLoader'),
    BULLDOZER:       t('equipTypeBulldozer'),
    FORKLIFT:        t('equipTypeForklift'),
    CONCRETE_MIXER:  t('equipTypeConcreteMixer'),
    GENERATOR:       t('equipTypeGenerator'),
    COMPRESSOR:      t('equipTypeCompressor'),
    SCAFFOLDING:     t('equipTypeScaffolding'),
    WELDING_MACHINE: t('equipTypeWelding'),
    TRUCK:           t('equipTypeTruck'),
    DUMP_TRUCK:      t('equipTypeDumpTruck'),
    WATER_TANKER:    t('equipTypeWaterTanker'),
    LIGHT_EQUIPMENT: t('equipTypeLightEquip'),
    OTHER_EQUIPMENT: t('equipTypeOther'),
  }
  return map[v] ?? v
}

// ─── Transformers ─────────────────────────────────────────────────────────────

function transformCar(raw: ListingItem, t: T): UnifiedListingItem {
  const details: DetailItem[] = [
    raw.year         ? { icon: 'Calendar',  value: String(raw.year) }                                    : null,
    raw.mileage      ? { icon: 'Gauge',     value: `${raw.mileage.toLocaleString('en-US')} ${t('km')}` } : null,
    raw.transmission ? { icon: 'Settings2', value: translateTransmission(raw.transmission, t) } : null,
    raw.fuelType     ? { icon: 'Fuel',      value: translateFuel(raw.fuelType, t) }             : null,
    raw.bodyType     ? { icon: 'Car',       value: translateBody(raw.bodyType, t) }             : null,
  ].filter(Boolean) as DetailItem[]

  return {
    id:                  raw.id,
    category:            'cars',
    title:               `${raw.make} ${raw.model} ${raw.year}`,
    price:               (raw.price && Number(raw.price) > 0) ? Number(raw.price) : null,
    priceLabel:          raw.listingType === 'RENTAL' ? t('daily') : null,
    currency:            'OMR',
    images:              imgs(raw.images),
    governorate:         raw.governorate ?? null,
    createdAt:           raw.createdAt,
    viewCount:           raw.viewCount,
    primaryBadge:        raw.listingType ? getListingTypeBadge(raw.listingType, t) : null,
    secondaryBadge:      raw.condition  ? getConditionBadge(raw.condition, t)     : null,
    details:             details.slice(0, 5),
    href:                raw.listingType === 'RENTAL' ? `/rental/car/${raw.id}` : `/sale/car/${raw.id}`,
    phoneNumber:         raw.seller?.phone ?? null,
    isPriceNegotiable:   raw.isPriceNegotiable,
    sellerVerified:      raw.seller?.isVerified ?? false,
    favoriteEntityType:  'LISTING',
    attributes: {
      // Preserve all raw API fields for advanced use cases
      slug: raw.slug,
      make: raw.make,
      model: raw.model,
      year: raw.year,
      price: raw.price,
      currency: raw.currency,
      mileage: raw.mileage,
      fuelType: raw.fuelType,
      transmission: raw.transmission,
      condition: raw.condition,
      bodyType: raw.bodyType,
      exteriorColor: raw.exteriorColor,
      interior: raw.interior,
      features: raw.features,
      engineSize: raw.engineSize,
      horsepower: raw.horsepower,
      doors: raw.doors,
      seats: raw.seats,
      driveType: raw.driveType,
      description: raw.description,
      listingType: raw.listingType,
      dailyPrice: raw.dailyPrice,
      weeklyPrice: raw.weeklyPrice,
      monthlyPrice: raw.monthlyPrice,
      minRentalDays: raw.minRentalDays,
      depositAmount: raw.depositAmount,
      kmLimitPerDay: raw.kmLimitPerDay,
      withDriver: raw.withDriver,
      deliveryAvailable: raw.deliveryAvailable,
      insuranceIncluded: raw.insuranceIncluded,
      cancellationPolicy: raw.cancellationPolicy,
      availableFrom: raw.availableFrom,
      availableTo: raw.availableTo,
      city: raw.city,
      latitude: raw.latitude,
      longitude: raw.longitude,
      isPremium: raw.isPremium,
      featuredUntil: raw.featuredUntil,
      status: raw.status,
    },
  }
}

function transformBus(raw: BusListingItem, t: T): UnifiedListingItem {
  const details: DetailItem[] = [
    raw.year         ? { icon: 'Calendar',  value: String(raw.year) }                                     : null,
    raw.capacity     ? { icon: 'Users',     value: `${raw.capacity} ${t('passenger')}` }                  : null,
    raw.make         ? { icon: 'Bus',       value: raw.make }                                             : null,
    raw.fuelType     ? { icon: 'Fuel',      value: translateFuel(raw.fuelType, t) }                        : null,
    raw.mileage      ? { icon: 'Gauge',     value: `${raw.mileage.toLocaleString('en-US')} ${t('km')}` }  : null,
  ].filter(Boolean) as DetailItem[]

  return {
    id:                  raw.id,
    category:            'buses',
    title:               raw.title,
    price:               (raw.price && Number(raw.price) > 0) ? Number(raw.price) : null,
    priceLabel:          raw.busListingType === 'BUS_RENT' ? t('daily') : null,
    currency:            'OMR',
    images:              imgs(raw.images),
    governorate:         raw.governorate ?? null,
    createdAt:           raw.createdAt,
    viewCount:           raw.viewCount,
    primaryBadge:        getListingTypeBadge(raw.busListingType, t),
    secondaryBadge:      raw.busType ? getBusTypeBadge(raw.busType, t) : null,
    details:             details.slice(0, 5),
    href:                raw.busListingType === 'BUS_RENT' ? `/rental/bus/${raw.id}` : `/sale/bus/${raw.id}`,
    phoneNumber:         raw.contactPhone ?? raw.user?.phone ?? null,
    whatsappNumber:      raw.whatsapp ?? null,
    isPriceNegotiable:   raw.isPriceNegotiable,
    sellerVerified:      raw.user?.isVerified ?? false,
    favoriteEntityType:  'BUS_LISTING',
    attributes: {
      // Preserve all raw API fields for advanced use cases
      slug: raw.slug,
      description: raw.description,
      busListingType: raw.busListingType,
      busType: raw.busType,
      make: raw.make,
      model: raw.model,
      year: raw.year,
      capacity: raw.capacity,
      mileage: raw.mileage,
      fuelType: raw.fuelType,
      transmission: raw.transmission,
      condition: raw.condition,
      features: raw.features,
      plateNumber: raw.plateNumber,
      price: raw.price,
      currency: raw.currency,
      contractType: raw.contractType,
      contractClient: raw.contractClient,
      contractMonthly: raw.contractMonthly,
      contractDuration: raw.contractDuration,
      contractExpiry: raw.contractExpiry,
      dailyPrice: raw.dailyPrice,
      monthlyPrice: raw.monthlyPrice,
      minRentalDays: raw.minRentalDays,
      withDriver: raw.withDriver,
      deliveryAvailable: raw.deliveryAvailable,
      depositAmount: raw.depositAmount,
      kmLimitPerDay: raw.kmLimitPerDay,
      insuranceIncluded: raw.insuranceIncluded,
      cancellationPolicy: raw.cancellationPolicy,
      availableFrom: raw.availableFrom,
      availableTo: raw.availableTo,
      requestPassengers: raw.requestPassengers,
      city: raw.city,
      latitude: raw.latitude,
      longitude: raw.longitude,
      status: raw.status,
    },
  }
}

function transformEquipment(raw: EquipmentListingItem, t: T): UnifiedListingItem {
  const details: DetailItem[] = [
    raw.equipmentType ? { icon: 'Wrench',    value: translateEquipmentType(raw.equipmentType, t) }           : null,
    raw.make          ? { icon: 'Settings2', value: raw.make }                                                 : null,
    raw.year          ? { icon: 'Calendar',  value: String(raw.year) }                                         : null,
    raw.hoursUsed     ? { icon: 'Gauge',     value: `${raw.hoursUsed.toLocaleString('en-US')} ${t('hoursUnit')}` } : null,
    raw.power         ? { icon: 'Fuel',      value: raw.power }                                                : null,
  ].filter(Boolean) as DetailItem[]

  return {
    id:                  raw.id,
    category:            'equipment',
    title:               raw.title,
    price:               (raw.price && Number(raw.price) > 0) ? Number(raw.price) : null,
    priceLabel:          raw.listingType === 'EQUIPMENT_RENT' ? t('daily') : null,
    currency:            'OMR',
    images:              imgs(raw.images),
    governorate:         raw.governorate ?? null,
    createdAt:           raw.createdAt,
    viewCount:           raw.viewCount,
    primaryBadge:        getListingTypeBadge(raw.listingType, t),
    secondaryBadge:      raw.condition ? getConditionBadge(raw.condition, t) : null,
    details:             details.slice(0, 5),
    href:                raw.listingType === 'EQUIPMENT_RENT' ? `/rental/equipment/${raw.id}` : `/sale/equipment/${raw.id}`,
    phoneNumber:         raw.contactPhone ?? raw.user?.phone ?? null,
    whatsappNumber:      raw.whatsapp ?? null,
    isPriceNegotiable:   raw.isPriceNegotiable,
    sellerVerified:      raw.user?.isVerified ?? false,
    favoriteEntityType:  'EQUIPMENT_LISTING',
    attributes: {
      // Preserve all raw API fields for advanced use cases
      slug: raw.slug,
      description: raw.description,
      equipmentType: raw.equipmentType,
      listingType: raw.listingType,
      make: raw.make,
      model: raw.model,
      year: raw.year,
      condition: raw.condition,
      capacity: raw.capacity,
      power: raw.power,
      weight: raw.weight,
      hoursUsed: raw.hoursUsed,
      features: raw.features,
      price: raw.price,
      dailyPrice: raw.dailyPrice,
      weeklyPrice: raw.weeklyPrice,
      monthlyPrice: raw.monthlyPrice,
      currency: raw.currency,
      withOperator: raw.withOperator,
      deliveryAvailable: raw.deliveryAvailable,
      minRentalDays: raw.minRentalDays,
      depositAmount: raw.depositAmount,
      kmLimitPerDay: raw.kmLimitPerDay,
      insuranceIncluded: raw.insuranceIncluded,
      cancellationPolicy: raw.cancellationPolicy,
      availableFrom: raw.availableFrom,
      availableTo: raw.availableTo,
      city: raw.city,
      latitude: raw.latitude,
      longitude: raw.longitude,
      status: raw.status,
    },
  }
}

function transformPart(raw: SparePartItem, t: T): UnifiedListingItem {
  const details: DetailItem[] = [
    raw.partCategory            ? { icon: 'Settings',  value: translatePartCategory(raw.partCategory, t) }          : null,
    raw.compatibleMakes?.length ? { icon: 'Car',       value: raw.compatibleMakes.slice(0, 2).join('، ') }          : null,
    raw.condition               ? { icon: 'Tag',       value: getConditionBadge(raw.condition, t).label }            : null,
    raw.yearFrom && raw.yearTo
      ? { icon: 'Calendar', value: `${raw.yearFrom}–${raw.yearTo}` }                                       : null,
    raw.governorate             ? { icon: 'MapPin',    value: raw.governorate }                             : null,
  ].filter(Boolean) as DetailItem[]

  return {
    id:                  raw.id,
    category:            'parts',
    title:               raw.title,
    price:               (raw.price && Number(raw.price) > 0) ? Number(raw.price) : null,
    priceLabel:          null,
    currency:            'OMR',
    images:              imgs(raw.images),
    governorate:         raw.governorate ?? null,
    createdAt:           raw.createdAt,
    viewCount:           raw.viewCount,
    primaryBadge:        raw.condition ? getConditionBadge(raw.condition, t) : null,
    secondaryBadge:      raw.isOriginal ? { label: t('oem'), color: 'green' } : { label: t('aftermarket'), color: 'orange' },
    details:             details.slice(0, 5),
    href:                `/sale/part/${raw.id}`,
    phoneNumber:         raw.contactPhone ?? raw.seller?.phone ?? null,
    whatsappNumber:      raw.whatsapp ?? null,
    isPriceNegotiable:   raw.isPriceNegotiable,
    sellerVerified:      raw.seller?.isVerified ?? false,
    favoriteEntityType:  'SPARE_PART',
    attributes: {
      // Preserve all raw API fields for advanced use cases
      slug: raw.slug,
      description: raw.description,
      partNumber: raw.partNumber,
      partCategory: raw.partCategory,
      compatibleMakes: raw.compatibleMakes,
      compatibleModels: raw.compatibleModels,
      yearFrom: raw.yearFrom,
      yearTo: raw.yearTo,
      condition: raw.condition,
      isOriginal: raw.isOriginal,
      price: raw.price,
      currency: raw.currency,
      city: raw.city,
      latitude: raw.latitude,
      longitude: raw.longitude,
      status: raw.status,
    },
  }
}

function transformService(raw: CarServiceItem, t: T): UnifiedListingItem {
  const details: DetailItem[] = [
    raw.serviceType   ? { icon: 'Wrench',    value: translateServiceType(raw.serviceType, t) } : null,
    raw.providerType  ? { icon: 'Building2', value: translateProvider(raw.providerType, t) }   : null,
    raw.isHomeService ? { icon: 'MapPin',    value: t('homeService') }   : null,
    raw.governorate   ? { icon: 'MapPin',    value: raw.governorate }    : null,
    raw.priceFrom && raw.priceTo
      ? { icon: 'Tag', value: `${Number(raw.priceFrom).toLocaleString('en-US')}–${Number(raw.priceTo).toLocaleString('en-US')}` } : null,
  ].filter(Boolean) as DetailItem[]

  const price = raw.priceFrom ? Number(raw.priceFrom) : null

  return {
    id:                  raw.id,
    category:            'services',
    title:               raw.title,
    price,
    priceLabel:          price ? t('startingFrom') : null,
    currency:            'OMR',
    images:              imgs(raw.images),
    governorate:         raw.governorate ?? null,
    createdAt:           raw.createdAt,
    viewCount:           raw.viewCount,
    primaryBadge:        raw.serviceType ? { label: translateServiceType(raw.serviceType, t), color: 'green' } : null,
    secondaryBadge:      raw.isHomeService ? { label: t('homeService'), color: 'green' } : null,
    details:             details.slice(0, 5),
    href:                `/sale/service/${raw.id}`,
    phoneNumber:         raw.contactPhone ?? raw.user?.phone ?? null,
    whatsappNumber:      raw.whatsapp ?? null,
    sellerVerified:      raw.user?.isVerified ?? false,
    favoriteEntityType:  'CAR_SERVICE',
    attributes: {
      // Preserve all raw API fields for advanced use cases
      slug: raw.slug,
      description: raw.description,
      serviceType: raw.serviceType,
      providerType: raw.providerType,
      isHomeService: raw.isHomeService,
      workingHoursOpen: raw.workingHoursOpen,
      workingHoursClose: raw.workingHoursClose,
      priceFrom: raw.priceFrom,
      priceTo: raw.priceTo,
      currency: raw.currency,
      specializations: raw.specializations,
      city: raw.city,
      latitude: raw.latitude,
      longitude: raw.longitude,
      status: raw.status,
    },
  }
}
