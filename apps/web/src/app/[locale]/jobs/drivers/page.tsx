'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useDrivers } from '@/lib/api';
import type { DriverProfileItem } from '@/lib/api';
import { getGovernorates } from '@/lib/location-data';
import { getImageUrl } from '@/lib/image-utils';
import { useLocale } from 'next-intl';
import Image from 'next/image';

const LICENSE_LABELS: Record<string, string> = {
  LIGHT: 'خفيفة', HEAVY: 'ثقيلة', TRANSPORT: 'نقل', BUS: 'حافلات', MOTORCYCLE: 'دراجة',
};

export default function DriversPage() {
  const locale = useLocale();
  const govs = getGovernorates('OM', locale);
  const [filters, setFilters] = useState({ governorate: '', licenseType: '', isVerified: '' });
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: '12' };
  if (filters.governorate) params.governorate = filters.governorate;
  if (filters.licenseType) params.licenseType = filters.licenseType;
  if (filters.isVerified) params.isVerified = filters.isVerified;

  const { data, isLoading } = useDrivers(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-20 relative z-10 pb-16">
          <h1 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">group</span>
            السائقون المتاحون
          </h1>

          {/* Filters */}
          <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3">
            <select value={filters.governorate} onChange={(e) => { setFilters({ ...filters, governorate: e.target.value }); setPage(1); }}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-2 px-3 text-sm">
              <option value="">كل المحافظات</option>
              {govs.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <select value={filters.licenseType} onChange={(e) => { setFilters({ ...filters, licenseType: e.target.value }); setPage(1); }}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-2 px-3 text-sm">
              <option value="">كل الرخص</option>
              {Object.entries(LICENSE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filters.isVerified} onChange={(e) => { setFilters({ ...filters, isVerified: e.target.value }); setPage(1); }}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-2 px-3 text-sm">
              <option value="">الكل</option>
              <option value="true">الموثقون فقط</option>
            </select>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="h-12 w-12 bg-surface-container-low rounded-full mb-3" />
                  <div className="h-5 bg-surface-container-low rounded w-2/3 mb-2" />
                  <div className="h-4 bg-surface-container-low rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">person_off</span>
              <p className="text-lg font-bold text-on-surface-variant">لا يوجد سائقون متاحون</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition ${p === page ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

function DriverCard({ driver }: { driver: DriverProfileItem }) {
  return (
    <Link href={`/jobs/drivers/${driver.id}`} className="glass-card rounded-xl p-6 hover:shadow-md transition-shadow block">
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-low shrink-0">
          {driver.user.avatarUrl ? (
            <Image src={getImageUrl(driver.user.avatarUrl)} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">person</span>
            </div>
          )}
          {driver.isVerified && (
            <div className="absolute -bottom-0.5 -end-0.5 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
              <span className="material-symbols-outlined text-xs">verified</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-on-surface truncate">{driver.user.displayName || driver.user.username}</h3>
          <p className="text-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {driver.governorate}{driver.city ? ` - ${driver.city}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {driver.licenseTypes.map((lt) => (
          <span key={lt} className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
            {LICENSE_LABELS[lt] || lt}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">work_history</span>
          {driver.experienceYears ? `${driver.experienceYears} سنوات خبرة` : 'غير محدد'}
        </span>
        {driver.averageRating && (
          <span className="flex items-center gap-1 text-amber-600">
            <span className="material-symbols-outlined text-sm">star</span>
            {driver.averageRating.toFixed(1)} ({driver.reviewCount})
          </span>
        )}
      </div>

      {!driver.isAvailable && (
        <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">غير متاح حاليا</span>
      )}
    </Link>
  );
}
