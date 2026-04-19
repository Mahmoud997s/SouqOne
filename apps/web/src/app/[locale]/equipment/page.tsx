'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useEquipmentListings, useEquipmentRequests, useOperatorListings } from '@/lib/api/equipment';
import type { EquipmentListingItem, EquipmentRequestItem, OperatorListingItem } from '@/lib/api/equipment';
import { getGovernorates, type LocationOption } from '@/lib/location-data';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';
import { useFavoriteIds, useToggleFavorite } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

const EQUIP_TYPE_ICONS: Record<string, string> = {
  EXCAVATOR: 'precision_manufacturing', CRANE: 'crane', LOADER: 'front_loader', BULLDOZER: 'agriculture',
  FORKLIFT: 'forklift', CONCRETE_MIXER: 'concrete', GENERATOR: 'bolt', COMPRESSOR: 'air',
  SCAFFOLDING: 'construction', WELDING_MACHINE: 'hardware', TRUCK: 'local_shipping', DUMP_TRUCK: 'local_shipping',
  WATER_TANKER: 'water_drop', LIGHT_EQUIPMENT: 'build', OTHER_EQUIPMENT: 'category',
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-600', IN_PROGRESS: 'bg-amber-600', CLOSED: 'bg-gray-500', CANCELLED: 'bg-red-600',
};

const EQUIP_TYPE_KEYS: Record<string, string> = {
  EXCAVATOR: 'equipExcavator', CRANE: 'equipCrane', LOADER: 'equipLoader', BULLDOZER: 'equipBulldozer',
  FORKLIFT: 'equipForklift', CONCRETE_MIXER: 'equipConcreteMixer', GENERATOR: 'equipGenerator', COMPRESSOR: 'equipCompressor',
  SCAFFOLDING: 'equipScaffolding', WELDING_MACHINE: 'equipWeldingMachine', TRUCK: 'equipTruck', DUMP_TRUCK: 'equipDumpTruck',
  WATER_TANKER: 'equipWaterTanker', LIGHT_EQUIPMENT: 'equipLightEquipment', OTHER_EQUIPMENT: 'equipOther',
};

type Tab = 'listings' | 'requests' | 'operators';

function EquipmentCard({ item }: { item: EquipmentListingItem }) {
  const tp = useTranslations('pages');
  const tl = useTranslations('listings');
  const tt = useTranslations('time');
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const isFav = favIds?.includes(`EQUIPMENT_LISTING:${item.id}`) ?? false;

  const listingLabel = item.listingType === 'EQUIPMENT_SALE' ? tl('typeSale') : tl('typeRental');
  const img = item.images?.[0]?.url;
  const priceText = item.listingType === 'EQUIPMENT_SALE'
    ? (item.price ? `${Number(item.price).toLocaleString()} ${item.currency}` : null)
    : (item.dailyPrice ? `${Number(item.dailyPrice).toLocaleString()} ${item.currency}${tp('equipPerDay')}` : item.monthlyPrice ? `${Number(item.monthlyPrice).toLocaleString()} ${item.currency}${tp('equipPerMonth')}` : null);

  return (
    <article className="h-full rounded-xl overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 border border-outline-variant/10">
      <Link href={`/equipment/${item.id}`} className="h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
          {img ? <Image src={img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:640px) 50vw, 25vw" /> : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl sm:text-5xl text-on-surface-variant/20">{EQUIP_TYPE_ICONS[item.equipmentType] || 'construction'}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {/* Fav */}
          {isAuthenticated && (
            <button onClick={e => { e.preventDefault(); toggleFav.mutate({ entityType: 'EQUIPMENT_LISTING', entityId: item.id }); }}
              className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
              <span className={`material-symbols-outlined text-[18px] sm:text-[20px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${isFav ? 'text-red-500' : 'text-white'}`}
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </button>
          )}
          {/* Type top-right */}
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
            {listingLabel}
          </span>
          {/* Verified */}
          {item.user?.isVerified && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-blue-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </span>
          )}
          {/* Price */}
          {priceText && (
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
              <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[9px] sm:text-xs font-black bg-primary text-on-primary shadow-sm">{priceText}</span>
            </div>
          )}
        </div>
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
          <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">{item.title}</h3>
          <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[10px] text-on-surface-variant">
            <span className="shrink-0">{relativeTimeT(item.createdAt, tt, locale)}</span>
            {item.governorate && <span className="text-outline/40">·</span>}
            {item.governorate && (
              <span className="flex items-center gap-px shrink-0">
                <span className="material-symbols-outlined text-[9px] sm:text-[11px]">location_on</span>
                {item.governorate}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

function RequestCard({ item }: { item: EquipmentRequestItem }) {
  const tp = useTranslations('pages');
  const tt = useTranslations('time');
  const locale = useLocale();

  const typeLabel = tp(EQUIP_TYPE_KEYS[item.equipmentType] || 'equipOther');
  const statusKey = `equipStatus${item.requestStatus.charAt(0)}${item.requestStatus.slice(1).toLowerCase().replace(/_./g, m => m[1].toUpperCase())}` as any;
  const statusLabel = tp.has(statusKey) ? tp(statusKey) : item.requestStatus;
  const bidsCount = item._count?.bids ?? item.bids?.length ?? 0;
  return (
    <Link href={`/equipment/requests/${item.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all hover:-translate-y-0.5 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">{EQUIP_TYPE_ICONS[item.equipmentType] || 'construction'}</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-surface line-clamp-1">{item.title}</h3>
            <p className="text-[11px] text-on-surface-variant">{typeLabel} · {tp('equipQuantity', { count: item.quantity })}</p>
          </div>
        </div>
        <span className={`text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg ${REQUEST_STATUS_COLORS[item.requestStatus]}`}>{statusLabel}</span>
      </div>
      <p className="text-xs text-on-surface-variant line-clamp-2">{item.description}</p>
      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
        {item.budgetMax && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">payments</span>{tp('equipUpTo', { amount: Number(item.budgetMax).toLocaleString(), currency: item.currency })}</span>}
        {item.governorate && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">location_on</span>{item.governorate}</span>}
      </div>
      <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 pt-2 border-t border-outline-variant/5">
        <span>{relativeTimeT(item.createdAt, tt, locale)}</span>
        <span className="flex items-center gap-0.5 font-bold text-primary"><span className="material-symbols-outlined text-xs">gavel</span>{tp('equipBids', { count: bidsCount })}</span>
      </div>
    </Link>
  );
}

function OperatorCard({ item }: { item: OperatorListingItem }) {
  const tp = useTranslations('pages');

  const OPERATOR_TYPE_LABELS: Record<string, string> = {
    DRIVER: tp('equipDriverType'), OPERATOR: tp('equipOperatorType'), TECHNICIAN: tp('equipTechnicianType'), MAINTENANCE: tp('equipMaintenanceType'),
  };
  const rate = item.dailyRate ? `${Number(item.dailyRate).toLocaleString()} ${item.currency}${tp('equipPerDay')}` : item.hourlyRate ? `${Number(item.hourlyRate).toLocaleString()} ${item.currency}${tp('equipPerHour')}` : tp('callForPrice');
  return (
    <Link href={`/equipment/operators/${item.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all hover:-translate-y-0.5 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">engineering</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-on-surface line-clamp-1">{item.title}</h3>
          <p className="text-[11px] text-on-surface-variant">{OPERATOR_TYPE_LABELS[item.operatorType]}{item.experienceYears ? ` · ${tp('equipYearsExp', { count: item.experienceYears })}` : ''}</p>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant line-clamp-2">{item.description}</p>
      {item.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1">{item.specializations.slice(0, 3).map(s => (
          <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{s}</span>
        ))}</div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/5">
        <p className="text-primary font-black text-sm">{rate}</p>
        {item.governorate && <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">location_on</span>{item.governorate}</span>}
      </div>
    </Link>
  );
}

export default function EquipmentPage() {
  const tp = useTranslations('pages');
  const tl = useTranslations('listings');
  const locale = useLocale();

  const EQUIP_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    Object.entries(EQUIP_TYPE_KEYS).map(([k, v]) => [k, tp(v as any)])
  );

  const [tab, setTab] = useState<Tab>('listings');
  const [governorate, setGovernorate] = useState('');
  const [equipType, setEquipType] = useState('');
  const [listingType, setListingType] = useState('');
  const [page, setPage] = useState(1);

  const listingParams: Record<string, string> = { page: String(page), limit: '20' };
  if (equipType) listingParams.equipmentType = equipType;
  if (listingType) listingParams.listingType = listingType;
  if (governorate) listingParams.governorate = governorate;

  const reqParams: Record<string, string> = { page: String(page), limit: '20', requestStatus: 'OPEN' };
  if (equipType) reqParams.equipmentType = equipType;
  if (governorate) reqParams.governorate = governorate;

  const opParams: Record<string, string> = { page: String(page), limit: '20' };
  if (governorate) opParams.governorate = governorate;

  const listings = useEquipmentListings(tab === 'listings' ? listingParams : undefined);
  const requests = useEquipmentRequests(tab === 'requests' ? reqParams : undefined);
  const operators = useOperatorListings(tab === 'operators' ? opParams : undefined);

  const tabItems = [
    { key: 'listings' as Tab, label: tp('equipTabListings'), icon: 'construction' },
    { key: 'requests' as Tab, label: tp('equipTabRequests'), icon: 'assignment' },
    { key: 'operators' as Tab, label: tp('equipTabOperators'), icon: 'engineering' },
  ];

  return (
    <>
      <Navbar />
      <main className="pb-16 dark:bg-gradient-to-br dark:from-[#0c0f1a] dark:via-[#101528] dark:to-[#0e1220]">
        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>

        {/* Hero */}
        <div className="bg-gradient-to-b from-amber-500/5 to-transparent dark:from-amber-500/10 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-3xl">construction</span>
                  {tp('equipTitle')}
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">{tp('equipSubtitle')}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/add-listing/equipment" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg">
                  <span className="material-symbols-outlined text-base">add</span>{tp('equipAddEquipment')}
                </Link>
                <Link href="/equipment/requests/new" className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg">
                  <span className="material-symbols-outlined text-base">assignment_add</span>{tp('equipRequestEquipment')}
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {tabItems.map(ti => (
                <button key={ti.key} onClick={() => { setTab(ti.key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${tab === ti.key ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:border-primary/30'}`}>
                  <span className="material-symbols-outlined text-sm">{ti.icon}</span>{ti.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <select value={equipType} onChange={e => { setEquipType(e.target.value); setPage(1); }}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-bold text-on-surface">
                <option value="">{tp('allTypes')}</option>
                {Object.entries(EQUIP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {tab === 'listings' && (
                <select value={listingType} onChange={e => { setListingType(e.target.value); setPage(1); }}
                  className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-bold text-on-surface">
                  <option value="">{tp('saleAndRent')}</option>
                  <option value="EQUIPMENT_SALE">{tl('typeSale')}</option>
                  <option value="EQUIPMENT_RENT">{tl('typeRental')}</option>
                </select>
              )}
              <select value={governorate} onChange={e => { setGovernorate(e.target.value); setPage(1); }}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-bold text-on-surface">
                <option value="">{tp('allGovernorates')}</option>
                {getGovernorates('OM', locale).map((g: LocationOption) => <option key={g.value} value={g.label}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          {/* Listings tab */}
          {tab === 'listings' && (
            listings.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-72" />)}
              </div>
            ) : (listings.data?.items?.length ?? 0) === 0 ? (
              <EmptyState icon="construction" label={tp('equipNoListings')} sub={tp('equipNoListingsSub')} href="/add-listing/equipment" btn={tp('equipAddEquipment')} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  {listings.data!.items.map(item => <EquipmentCard key={item.id} item={item} />)}
                </div>
                <Pagination meta={listings.data!.meta} page={page} setPage={setPage} />
              </>
            )
          )}

          {/* Requests tab */}
          {tab === 'requests' && (
            requests.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-48" />)}
              </div>
            ) : (requests.data?.items?.length ?? 0) === 0 ? (
              <EmptyState icon="assignment" label={tp('equipNoRequests')} sub={tp('equipNoRequestsSub')} href="/equipment/requests/new" btn={tp('equipRequestEquipment')} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  {requests.data!.items.map(item => <RequestCard key={item.id} item={item} />)}
                </div>
                <Pagination meta={requests.data!.meta} page={page} setPage={setPage} />
              </>
            )
          )}

          {/* Operators tab */}
          {tab === 'operators' && (
            operators.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-48" />)}
              </div>
            ) : (operators.data?.items?.length ?? 0) === 0 ? (
              <EmptyState icon="engineering" label={tp('equipNoOperators')} sub={tp('equipNoOperatorsSub')} href="/add-listing/operator" btn={tp('equipRegisterOperator')} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  {operators.data!.items.map(item => <OperatorCard key={item.id} item={item} />)}
                </div>
                <Pagination meta={operators.data!.meta} page={page} setPage={setPage} />
              </>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function EmptyState({ icon, label, sub, href, btn }: { icon: string; label: string; sub: string; href: string; btn: string }) {
  return (
    <div className="text-center py-20">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">{icon}</span>
      <p className="text-on-surface-variant text-lg font-bold">{label}</p>
      <p className="text-on-surface-variant/60 text-sm mt-1">{sub}</p>
      <Link href={href} className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-black mt-6 hover:brightness-110 transition-all">
        <span className="material-symbols-outlined text-base">add</span>{btn}
      </Link>
    </div>
  );
}

function Pagination({ meta, page, setPage }: { meta: { totalPages: number; total: number }; page: number; setPage: (n: number) => void }) {
  const tp = useTranslations('pages');
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page <= 1} onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/20 disabled:opacity-30">{tp('previous')}</button>
      <span className="text-xs text-on-surface-variant">{page} / {meta.totalPages}</span>
      <button disabled={page >= meta.totalPages} onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/20 disabled:opacity-30">{tp('nextPage')}</button>
    </div>
  );
}
