'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { useMyListings, useDeleteListing } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';

type StatusFilter = 'ALL' | 'ACTIVE' | 'DRAFT' | 'SOLD';

const statusFilters: { key: StatusFilter; label: string; icon: string }[] = [
  { key: 'ALL', label: 'الكل', icon: 'list' },
  { key: 'ACTIVE', label: 'نشط', icon: 'check_circle' },
  { key: 'DRAFT', label: 'مسودة', icon: 'edit_note' },
  { key: 'SOLD', label: 'مباع', icon: 'sell' },
];

const statusLabels: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'نشط', cls: 'bg-brand-green/90 text-white' },
  DRAFT: { label: 'مسودة', cls: 'bg-amber-500/90 text-white' },
  SOLD: { label: 'مباع', cls: 'bg-outline/80 text-white' },
  EXPIRED: { label: 'منتهي', cls: 'bg-error/80 text-white' },
};

export default function MyListingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const params: Record<string, string> = { limit: '50' };
  if (statusFilter !== 'ALL') params.status = statusFilter;

  const { data, isLoading, refetch } = useMyListings(params);
  const deleteListing = useDeleteListing();

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background pt-28 pb-24 lg:pb-16" dir="rtl">
        <main className="max-w-6xl mx-auto px-4 md:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">directions_car</span>
                إعلاناتي
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                {total} إعلان{total !== 1 ? '' : ''}
              </p>
            </div>
            <Link
              href="/add-listing"
              className="btn-green px-6 py-3 text-sm font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-ambient"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              أضف إعلان جديد
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-black transition-all whitespace-nowrap ${
                  statusFilter === f.key
                    ? 'bg-surface-container-lowest dark:bg-surface-container text-primary shadow-sm border border-outline-variant/10 dark:border-outline-variant/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 dark:hover:bg-surface-container-high/30'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-container-high aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
                const st = statusLabels[item.status] ?? { label: item.status, cls: 'bg-outline/60 text-white' };
                return (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden group hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all"
                  >
                    {/* Card + status badge */}
                    <div className="relative">
                      <VehicleCard
                        id={item.id}
                        title={item.title}
                        make={item.make}
                        model={item.model}
                        year={item.year}
                        price={item.price}
                        currency={item.currency}
                        mileage={item.mileage}
                        fuelType={item.fuelType}
                        imageUrl={getImageUrl(img?.url)}
                        listingType={item.listingType}
                        dailyPrice={item.dailyPrice}
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-black px-2 py-1 ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>

                    {/* Mini stats */}
                    <div className="px-3 py-2 flex items-center gap-3 text-[11px] text-on-surface-variant border-t border-outline-variant/10 dark:border-outline-variant/20">
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        {item.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {new Date(item.createdAt).toLocaleDateString('ar-OM')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex border-t border-outline-variant/10 dark:border-outline-variant/20">
                      <Link
                        href={`/edit-listing/${item.id}`}
                        className="flex-1 py-2.5 text-center text-xs font-black text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        تعديل
                      </Link>
                      <div className="w-px bg-outline-variant/10 dark:bg-outline-variant/20" />
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                            deleteListing.mutate(item.id, { onSuccess: () => refetch() });
                          }
                        }}
                        className="flex-1 py-2.5 text-center text-xs font-black text-on-surface-variant hover:text-error hover:bg-error/5 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 p-12 md:p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
              </div>
              <h3 className="text-lg font-black text-on-surface mb-2">
                {statusFilter === 'ALL' ? 'لا توجد إعلانات بعد' : `لا توجد إعلانات ${statusFilters.find(f => f.key === statusFilter)?.label}`}
              </h3>
              <p className="text-sm text-on-surface-variant mb-6 max-w-xs mx-auto">أضف إعلانك الأول وابدأ الوصول لآلاف المهتمين</p>
              <Link
                href="/add-listing"
                className="inline-flex items-center gap-2 btn-editorial px-8 py-3 text-sm font-black hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                أضف إعلانك الأول
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </AuthGuard>
  );
}
