'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useEquipmentListings, useEquipmentRequests, useOperatorListings } from '@/lib/api/equipment';
import type { EquipmentListingItem, EquipmentRequestItem, OperatorListingItem } from '@/lib/api/equipment';
import { getGovernorates, type LocationOption } from '@/lib/location-data';

const EQUIP_TYPE_LABELS: Record<string, string> = {
  EXCAVATOR: 'حفار', CRANE: 'رافعة', LOADER: 'لودر', BULLDOZER: 'بلدوزر', FORKLIFT: 'رافعة شوكية',
  CONCRETE_MIXER: 'خلاطة خرسانة', GENERATOR: 'مولد كهربائي', COMPRESSOR: 'ضاغط هواء',
  SCAFFOLDING: 'سقالات', WELDING_MACHINE: 'ماكينة لحام', TRUCK: 'شاحنة', DUMP_TRUCK: 'قلاب',
  WATER_TANKER: 'صهريج مياه', LIGHT_EQUIPMENT: 'معدات خفيفة', OTHER_EQUIPMENT: 'أخرى',
};

const EQUIP_TYPE_ICONS: Record<string, string> = {
  EXCAVATOR: 'precision_manufacturing', CRANE: 'crane', LOADER: 'front_loader', BULLDOZER: 'agriculture',
  FORKLIFT: 'forklift', CONCRETE_MIXER: 'concrete', GENERATOR: 'bolt', COMPRESSOR: 'air',
  SCAFFOLDING: 'construction', WELDING_MACHINE: 'hardware', TRUCK: 'local_shipping', DUMP_TRUCK: 'local_shipping',
  WATER_TANKER: 'water_drop', LIGHT_EQUIPMENT: 'build', OTHER_EQUIPMENT: 'category',
};

const OPERATOR_TYPE_LABELS: Record<string, string> = {
  DRIVER: 'سائق', OPERATOR: 'مشغل', TECHNICIAN: 'فني', MAINTENANCE: 'صيانة',
};

const LISTING_TYPE_LABELS: Record<string, string> = { EQUIPMENT_SALE: 'للبيع', EQUIPMENT_RENT: 'للإيجار' };
const LISTING_TYPE_COLORS: Record<string, string> = {
  EQUIPMENT_SALE: 'bg-blue-600', EQUIPMENT_RENT: 'bg-violet-600',
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوح', IN_PROGRESS: 'جاري التنفيذ', CLOSED: 'مغلق', CANCELLED: 'ملغي',
};
const REQUEST_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-600', IN_PROGRESS: 'bg-amber-600', CLOSED: 'bg-gray-500', CANCELLED: 'bg-red-600',
};

type Tab = 'listings' | 'requests' | 'operators';

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const days = Math.floor(h / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return `منذ ${Math.floor(days / 30)} شهر`;
}

function EquipmentCard({ item }: { item: EquipmentListingItem }) {
  const img = item.images?.[0]?.url;
  const price = item.listingType === 'EQUIPMENT_SALE'
    ? (item.price ? `${Number(item.price).toLocaleString()} ${item.currency}` : 'اتصل للسعر')
    : (item.dailyPrice ? `${Number(item.dailyPrice).toLocaleString()} ${item.currency}/يوم` : item.monthlyPrice ? `${Number(item.monthlyPrice).toLocaleString()} ${item.currency}/شهر` : 'اتصل للسعر');

  return (
    <Link href={`/equipment/${item.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] bg-surface-container-low">
        {img ? <Image src={img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" /> : (
          <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-5xl text-on-surface-variant/20">{EQUIP_TYPE_ICONS[item.equipmentType] || 'construction'}</span></div>
        )}
        <span className={`absolute top-2 right-2 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg ${LISTING_TYPE_COLORS[item.listingType] || 'bg-primary'}`}>{LISTING_TYPE_LABELS[item.listingType]}</span>
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-bold text-sm text-on-surface line-clamp-1">{item.title}</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
          <span className="material-symbols-outlined text-xs">{EQUIP_TYPE_ICONS[item.equipmentType] || 'construction'}</span>
          {EQUIP_TYPE_LABELS[item.equipmentType]}
          {item.governorate && <><span className="mx-1">·</span><span className="material-symbols-outlined text-xs">location_on</span>{item.governorate}</>}
        </div>
        <p className="text-primary font-black text-sm">{price}</p>
        <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 pt-1 border-t border-outline-variant/5">
          <span>{relativeTime(item.createdAt)}</span>
          <div className="flex items-center gap-2">
            {item.withOperator && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[11px]">person</span>مع مشغل</span>}
            {item.deliveryAvailable && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[11px]">local_shipping</span>توصيل</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function RequestCard({ item }: { item: EquipmentRequestItem }) {
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
            <p className="text-[11px] text-on-surface-variant">{EQUIP_TYPE_LABELS[item.equipmentType]} · الكمية: {item.quantity}</p>
          </div>
        </div>
        <span className={`text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg ${REQUEST_STATUS_COLORS[item.requestStatus]}`}>{REQUEST_STATUS_LABELS[item.requestStatus]}</span>
      </div>
      <p className="text-xs text-on-surface-variant line-clamp-2">{item.description}</p>
      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
        {item.budgetMax && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">payments</span>حتى {Number(item.budgetMax).toLocaleString()} {item.currency}</span>}
        {item.governorate && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">location_on</span>{item.governorate}</span>}
      </div>
      <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 pt-2 border-t border-outline-variant/5">
        <span>{relativeTime(item.createdAt)}</span>
        <span className="flex items-center gap-0.5 font-bold text-primary"><span className="material-symbols-outlined text-xs">gavel</span>{bidsCount} عرض</span>
      </div>
    </Link>
  );
}

function OperatorCard({ item }: { item: OperatorListingItem }) {
  const rate = item.dailyRate ? `${Number(item.dailyRate).toLocaleString()} ${item.currency}/يوم` : item.hourlyRate ? `${Number(item.hourlyRate).toLocaleString()} ${item.currency}/ساعة` : 'اتصل للسعر';
  return (
    <Link href={`/equipment/operators/${item.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all hover:-translate-y-0.5 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">engineering</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-on-surface line-clamp-1">{item.title}</h3>
          <p className="text-[11px] text-on-surface-variant">{OPERATOR_TYPE_LABELS[item.operatorType]}{item.experienceYears ? ` · ${item.experienceYears} سنة خبرة` : ''}</p>
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
    { key: 'listings' as Tab, label: 'معدات متاحة', icon: 'construction' },
    { key: 'requests' as Tab, label: 'طلبات مفتوحة', icon: 'assignment' },
    { key: 'operators' as Tab, label: 'مشغلين', icon: 'engineering' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16" dir="rtl">
        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>

        {/* Hero */}
        <div className="bg-gradient-to-b from-amber-500/5 to-transparent dark:from-amber-500/10 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-3xl">construction</span>
                  سوق المعدات والخدمات
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">بيع · تأجير · طلبات · مشغلين</p>
              </div>
              <div className="flex gap-2">
                <Link href="/add-listing/equipment" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg">
                  <span className="material-symbols-outlined text-base">add</span>أضف معدة
                </Link>
                <Link href="/equipment/requests/new" className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg">
                  <span className="material-symbols-outlined text-base">assignment_add</span>اطلب معدة
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {tabItems.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${tab === t.key ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:border-primary/30'}`}>
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <select value={equipType} onChange={e => { setEquipType(e.target.value); setPage(1); }}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-bold text-on-surface">
                <option value="">كل الأنواع</option>
                {Object.entries(EQUIP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {tab === 'listings' && (
                <select value={listingType} onChange={e => { setListingType(e.target.value); setPage(1); }}
                  className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-bold text-on-surface">
                  <option value="">بيع وإيجار</option>
                  <option value="EQUIPMENT_SALE">للبيع</option>
                  <option value="EQUIPMENT_RENT">للإيجار</option>
                </select>
              )}
              <select value={governorate} onChange={e => { setGovernorate(e.target.value); setPage(1); }}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-bold text-on-surface">
                <option value="">كل المحافظات</option>
                {getGovernorates('OM').map((g: LocationOption) => <option key={g.value} value={g.label}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          {/* Listings tab */}
          {tab === 'listings' && (
            listings.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-72" />)}
              </div>
            ) : (listings.data?.items?.length ?? 0) === 0 ? (
              <EmptyState icon="construction" label="لا توجد معدات حالياً" sub="كن أول من ينشر إعلان معدة" href="/add-listing/equipment" btn="أضف معدة" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listings.data!.items.map(item => <EquipmentCard key={item.id} item={item} />)}
                </div>
                <Pagination meta={listings.data!.meta} page={page} setPage={setPage} />
              </>
            )
          )}

          {/* Requests tab */}
          {tab === 'requests' && (
            requests.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-48" />)}
              </div>
            ) : (requests.data?.items?.length ?? 0) === 0 ? (
              <EmptyState icon="assignment" label="لا توجد طلبات مفتوحة" sub="أنشئ طلب معدة واستقبل عروض" href="/equipment/requests/new" btn="اطلب معدة" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.data!.items.map(item => <RequestCard key={item.id} item={item} />)}
                </div>
                <Pagination meta={requests.data!.meta} page={page} setPage={setPage} />
              </>
            )
          )}

          {/* Operators tab */}
          {tab === 'operators' && (
            operators.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-48" />)}
              </div>
            ) : (operators.data?.items?.length ?? 0) === 0 ? (
              <EmptyState icon="engineering" label="لا يوجد مشغلين حالياً" sub="سجّل كمشغل وابدأ باستقبال الطلبات" href="/add-listing/operator" btn="سجّل كمشغل" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page <= 1} onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/20 disabled:opacity-30">السابق</button>
      <span className="text-xs text-on-surface-variant">{page} / {meta.totalPages}</span>
      <button disabled={page >= meta.totalPages} onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/20 disabled:opacity-30">التالي</button>
    </div>
  );
}
