'use client';

import React, { useState, useMemo } from 'react';
import { Link } from '@/i18n/navigation';

// ══════════════════════════════════════════════════════════════════════════════
// DATA: All routes in the application
// ══════════════════════════════════════════════════════════════════════════════

interface RouteInfo {
  path: string;
  label: string;
  group: string;
  auth: boolean;
  type: 'page' | 'landing' | 'detail' | 'form' | 'auth' | 'admin' | 'utility';
  cards: string[];
}

const ROUTES: RouteInfo[] = [
  // ── Public Pages ──
  { path: '/', label: 'الرئيسية (Home)', group: 'Public', auth: false, type: 'landing', cards: ['VehicleCard', 'JobCard (inline)', 'BusCard (inline)', 'EquipmentCard (inline)', 'PartsCard (inline)'] },
  { path: '/motors', label: 'لاندنج السيارات', group: 'Public', auth: false, type: 'landing', cards: ['VehicleCard', 'ServiceCard (inline)'] },
  { path: '/equipment', label: 'لاندنج المعدات', group: 'Public', auth: false, type: 'landing', cards: ['EquipmentCard (inline)', 'RequestCard (inline)', 'OperatorCard (inline)'] },
  { path: '/coming-soon', label: 'قريباً', group: 'Public', auth: false, type: 'page', cards: [] },
  { path: '/pricing', label: 'الأسعار', group: 'Public', auth: false, type: 'page', cards: ['PriceCard'] },

  // ── Browse / Listings ──
  { path: '/browse', label: 'التصفح العام', group: 'Browse', auth: false, type: 'page', cards: ['UnifiedCard'] },
  { path: '/browse/cars', label: 'سيارات للبيع/إيجار', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/parts', label: 'قطع غيار', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/services', label: 'خدمات السيارات', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/buses', label: 'الحافلات', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/equipment', label: 'المعدات (Browse)', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/transport', label: 'النقل', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/trips', label: 'الرحلات', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/browse/insurance', label: 'التأمين', group: 'Browse', auth: false, type: 'page', cards: ['ListingCard'] },

  // ── Detail Pages ──
  { path: '/sale/[type]/[id]', label: 'تفاصيل (بيع/خدمة/معدة/...)', group: 'Detail', auth: false, type: 'detail', cards: ['PriceCard', 'SellerCard', 'VehicleCard (similar)'] },
  { path: '/rental/[type]/[id]', label: 'تفاصيل إيجار', group: 'Detail', auth: false, type: 'detail', cards: ['RentalBookingCard', 'VehicleCard (similar)'] },
  { path: '/jobs/[id]', label: 'تفاصيل وظيفة', group: 'Detail', auth: false, type: 'detail', cards: ['SellerCard'] },
  { path: '/jobs/drivers/[id]', label: 'بروفايل سائق', group: 'Detail', auth: false, type: 'detail', cards: [] },
  { path: '/equipment/operators/[id]', label: 'تفاصيل مشغل', group: 'Detail', auth: false, type: 'detail', cards: [] },
  { path: '/equipment/requests/[id]', label: 'تفاصيل طلب معدة', group: 'Detail', auth: false, type: 'detail', cards: [] },
  { path: '/bookings/[id]', label: 'تفاصيل حجز', group: 'Detail', auth: true, type: 'detail', cards: ['BookingCard', 'SellerCard', 'ReviewCard'] },
  { path: '/seller/[id]', label: 'بروفايل بائع', group: 'Detail', auth: false, type: 'detail', cards: ['VehicleCard', 'UnifiedCard', 'GenericListingCard', 'ReviewCard'] },

  // ── Jobs ──
  { path: '/jobs', label: 'وظائف السائقين', group: 'Jobs', auth: false, type: 'page', cards: ['ListingCard'] },
  { path: '/jobs/drivers', label: 'ملفات السائقين', group: 'Jobs', auth: false, type: 'page', cards: [] },
  { path: '/jobs/new', label: 'إضافة وظيفة', group: 'Jobs', auth: true, type: 'form', cards: [] },
  { path: '/jobs/my', label: 'وظائفي', group: 'Jobs', auth: true, type: 'page', cards: [] },
  { path: '/jobs/invites', label: 'الدعوات', group: 'Jobs', auth: true, type: 'page', cards: [] },
  { path: '/jobs/onboarding', label: 'بيانات السائق', group: 'Jobs', auth: true, type: 'form', cards: [] },
  { path: '/jobs/verification', label: 'التحقق', group: 'Jobs', auth: true, type: 'page', cards: [] },

  // ── Add Listing ──
  { path: '/add-listing', label: 'اختيار نوع الإعلان', group: 'Add Listing', auth: true, type: 'page', cards: [] },
  { path: '/add-listing/car', label: 'إضافة سيارة', group: 'Add Listing', auth: true, type: 'form', cards: [] },
  { path: '/add-listing/bus', label: 'إضافة حافلة', group: 'Add Listing', auth: true, type: 'form', cards: [] },
  { path: '/add-listing/equipment', label: 'إضافة معدة', group: 'Add Listing', auth: true, type: 'form', cards: [] },
  { path: '/add-listing/operator', label: 'تسجيل مشغل', group: 'Add Listing', auth: true, type: 'form', cards: [] },
  { path: '/add-listing/parts', label: 'إضافة قطعة غيار', group: 'Add Listing', auth: true, type: 'form', cards: [] },
  { path: '/add-listing/service', label: 'إضافة خدمة', group: 'Add Listing', auth: true, type: 'form', cards: [] },

  // ── Edit Listing ──
  { path: '/edit-listing/car/[id]', label: 'تعديل سيارة', group: 'Edit Listing', auth: true, type: 'form', cards: [] },
  { path: '/edit-listing/bus/[id]', label: 'تعديل حافلة', group: 'Edit Listing', auth: true, type: 'form', cards: [] },
  { path: '/edit-listing/equipment/[id]', label: 'تعديل معدة', group: 'Edit Listing', auth: true, type: 'form', cards: [] },
  { path: '/edit-listing/operator/[id]', label: 'تعديل مشغل', group: 'Edit Listing', auth: true, type: 'form', cards: [] },
  { path: '/edit-listing/parts/[id]', label: 'تعديل قطعة غيار', group: 'Edit Listing', auth: true, type: 'form', cards: [] },
  { path: '/edit-listing/service/[id]', label: 'تعديل خدمة', group: 'Edit Listing', auth: true, type: 'form', cards: [] },
  { path: '/edit-listing/job/[id]', label: 'تعديل وظيفة', group: 'Edit Listing', auth: true, type: 'form', cards: [] },

  // ── User ──
  { path: '/profile', label: 'البروفايل', group: 'User', auth: true, type: 'page', cards: [] },
  { path: '/my-listings', label: 'إعلاناتي', group: 'User', auth: true, type: 'page', cards: [] },
  { path: '/favorites', label: 'المفضلة', group: 'User', auth: true, type: 'page', cards: ['VehicleCard', 'UnifiedCard'] },
  { path: '/bookings', label: 'حجوزاتي', group: 'User', auth: true, type: 'page', cards: ['BookingCard'] },
  { path: '/notifications', label: 'الإشعارات', group: 'User', auth: true, type: 'page', cards: [] },
  { path: '/messages', label: 'المحادثات', group: 'User', auth: true, type: 'page', cards: [] },
  { path: '/messages/[id]', label: 'محادثة', group: 'User', auth: true, type: 'page', cards: ['AttachmentCard'] },

  // ── Auth ──
  { path: '/login', label: 'تسجيل الدخول', group: 'Auth', auth: false, type: 'auth', cards: [] },
  { path: '/register', label: 'إنشاء حساب', group: 'Auth', auth: false, type: 'auth', cards: [] },
  { path: '/forgot-password', label: 'نسيت كلمة السر', group: 'Auth', auth: false, type: 'auth', cards: [] },
  { path: '/reset-password', label: 'إعادة تعيين', group: 'Auth', auth: false, type: 'auth', cards: [] },

  // ── Payment ──
  { path: '/payment/success', label: 'نجاح الدفع', group: 'Payment', auth: true, type: 'utility', cards: [] },
  { path: '/payment/cancel', label: 'إلغاء الدفع', group: 'Payment', auth: true, type: 'utility', cards: [] },

  // ── Admin ──
  { path: '/admin/jobs', label: 'إدارة الوظائف', group: 'Admin', auth: true, type: 'admin', cards: [] },

  // ── Equipment Requests ──
  { path: '/equipment/requests/new', label: 'طلب معدة جديد', group: 'Equipment', auth: true, type: 'form', cards: [] },
];

// ══════════════════════════════════════════════════════════════════════════════
// DATA: Card components
// ══════════════════════════════════════════════════════════════════════════════

interface CardInfo {
  name: string;
  file: string;
  type: 'reusable' | 'inline';
  status: 'active' | 'duplicate' | 'unused';
  usedInPages: string[];
  purpose: string;
  color: string;
}

const CARDS: CardInfo[] = [
  {
    name: 'VehicleCard',
    file: 'features/ads/components/vehicle-card.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'عرض السيارات (بيع + إيجار)',
    color: '#3b82f6',
    usedInPages: ['/', '/motors', '/favorites', '/seller/[id]', '/sale/[type]/[id]', '/rental/[type]/[id]'],
  },
  {
    name: 'ListingCard',
    file: 'features/listings/components/ListingCard.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'عرض الإعلانات في صفحات Browse (سيارات، قطع، خدمات، حافلات...)',
    color: '#8b5cf6',
    usedInPages: ['/browse/cars', '/browse/parts', '/browse/services', '/browse/buses', '/browse/equipment', '/browse/transport', '/browse/trips', '/browse/insurance', '/jobs'],
  },
  {
    name: 'UnifiedCard',
    file: 'features/listings/components/UnifiedCard.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'كارت موحد متعدد الأنواع (بحث عام + مفضلة + بائع)',
    color: '#06b6d4',
    usedInPages: ['/browse', '/favorites', '/seller/[id]'],
  },
  {
    name: 'GenericListingCard',
    file: 'components/generic-listing-card.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'كارت عام للنقل والرحلات',
    color: '#f59e0b',
    usedInPages: ['/seller/[id]', '/transport', '/trips'],
  },
  {
    name: 'EquipmentCard (inline)',
    file: 'equipment/equipment-shell.tsx (local)',
    type: 'inline',
    status: 'duplicate',
    purpose: 'كارت معدات في اللاندنج بيج فقط (مكرر)',
    color: '#ef4444',
    usedInPages: ['/equipment'],
  },
  {
    name: 'JobCard (inline)',
    file: 'features/home/components/jobs-section.tsx (local)',
    type: 'inline',
    status: 'duplicate',
    purpose: 'كارت وظيفة في الهوم بيج فقط (مكرر)',
    color: '#ef4444',
    usedInPages: ['/'],
  },
  {
    name: 'ServiceCard (inline)',
    file: 'motors/motors-shell.tsx (local)',
    type: 'inline',
    status: 'duplicate',
    purpose: 'كارت خدمة في لاندنج السيارات فقط (مكرر)',
    color: '#ef4444',
    usedInPages: ['/motors'],
  },
  {
    name: 'BookingCard',
    file: 'components/booking-card.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'عرض تفاصيل الحجز',
    color: '#10b981',
    usedInPages: ['/bookings', '/bookings/[id]'],
  },
  {
    name: 'SellerCard',
    file: 'components/seller-card.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'بيانات البائع/المعلن',
    color: '#ec4899',
    usedInPages: ['/sale/[type]/[id]', '/rental/[type]/[id]', '/jobs/[id]', '/bookings/[id]'],
  },
  {
    name: 'ReviewCard',
    file: 'components/reviews/review-card.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'عرض التقييم',
    color: '#f97316',
    usedInPages: ['/seller/[id]', '/bookings/[id]'],
  },
  {
    name: 'PriceCard',
    file: 'features/sale/components/PriceCard.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'بطاقة السعر + CTA في صفحة التفاصيل',
    color: '#14b8a6',
    usedInPages: ['/sale/[type]/[id]', '/pricing'],
  },
  {
    name: 'RentalBookingCard',
    file: 'features/rental/components/RentalBookingCard.tsx',
    type: 'reusable',
    status: 'active',
    purpose: 'كارت حجز الإيجار (تاريخ + سعر)',
    color: '#a855f7',
    usedInPages: ['/rental/[type]/[id]'],
  },
  {
    name: 'AttachmentCard',
    file: 'features/chat/components/attachment-card.tsx',
    type: 'reusable',
    status: 'unused',
    purpose: 'عرض مرفقات الشات',
    color: '#6b7280',
    usedInPages: [],
  },
  {
    name: 'AuthCard',
    file: 'components/auth/auth-card.tsx',
    type: 'reusable',
    status: 'unused',
    purpose: 'كارت تسجيل دخول (غير مستخدم)',
    color: '#6b7280',
    usedInPages: [],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// GROUPS
// ══════════════════════════════════════════════════════════════════════════════

const GROUPS = ['Public', 'Browse', 'Detail', 'Jobs', 'Add Listing', 'Edit Listing', 'User', 'Auth', 'Payment', 'Admin', 'Equipment'] as const;

const GROUP_COLORS: Record<string, string> = {
  'Public': '#3b82f6',
  'Browse': '#8b5cf6',
  'Detail': '#06b6d4',
  'Jobs': '#f59e0b',
  'Add Listing': '#10b981',
  'Edit Listing': '#14b8a6',
  'User': '#ec4899',
  'Auth': '#6b7280',
  'Payment': '#ef4444',
  'Admin': '#dc2626',
  'Equipment': '#f97316',
};

const GROUP_ICONS: Record<string, string> = {
  'Public': 'home',
  'Browse': 'search',
  'Detail': 'info',
  'Jobs': 'work',
  'Add Listing': 'add_circle',
  'Edit Listing': 'edit',
  'User': 'person',
  'Auth': 'lock',
  'Payment': 'payment',
  'Admin': 'admin_panel_settings',
  'Equipment': 'construction',
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

type ViewMode = 'routes' | 'cards' | 'diagram';

export default function SitemapPage() {
  const [view, setView] = useState<ViewMode>('diagram');
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const stats = useMemo(() => ({
    totalRoutes: ROUTES.length,
    totalCards: CARDS.length,
    reusableCards: CARDS.filter(c => c.type === 'reusable' && c.status === 'active').length,
    inlineCards: CARDS.filter(c => c.type === 'inline').length,
    unusedCards: CARDS.filter(c => c.status === 'unused').length,
    duplicateCards: CARDS.filter(c => c.status === 'duplicate').length,
    authRoutes: ROUTES.filter(r => r.auth).length,
    publicRoutes: ROUTES.filter(r => !r.auth).length,
  }), []);

  const filteredRoutes = useMemo(() => {
    if (!search) return ROUTES;
    const q = search.toLowerCase();
    return ROUTES.filter(r => r.path.toLowerCase().includes(q) || r.label.toLowerCase().includes(q));
  }, [search]);

  const highlightedPages = selectedCard ? CARDS.find(c => c.name === selectedCard)?.usedInPages ?? [] : [];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-100 font-sans" dir="ltr">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">hub</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">SouqOne Architecture Map</h1>
              <p className="text-[11px] text-gray-500">{stats.totalRoutes} Routes &middot; {stats.totalCards} Card Components</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search routes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              {(['diagram', 'routes', 'cards'] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  {v === 'diagram' ? 'Card Map' : v === 'routes' ? 'All Routes' : 'All Cards'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-6">

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {[
            { label: 'Total Routes', value: stats.totalRoutes, icon: 'route', color: 'blue' },
            { label: 'Public', value: stats.publicRoutes, icon: 'public', color: 'emerald' },
            { label: 'Auth Required', value: stats.authRoutes, icon: 'lock', color: 'amber' },
            { label: 'Total Cards', value: stats.totalCards, icon: 'dashboard', color: 'purple' },
            { label: 'Reusable', value: stats.reusableCards, icon: 'check_circle', color: 'green' },
            { label: 'Inline (dup)', value: stats.inlineCards, icon: 'warning', color: 'red' },
            { label: 'Unused', value: stats.unusedCards, icon: 'block', color: 'gray' },
            { label: 'Duplicates', value: stats.duplicateCards, icon: 'content_copy', color: 'orange' },
          ].map(s => (
            <div key={s.label} className={`p-3 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20`}>
              <span className="material-symbols-outlined text-[16px] opacity-60">{s.icon}</span>
              <p className="text-2xl font-black mt-1">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            VIEW: Card ↔ Page Diagram
        ════════════════════════════════════════════════════════════════════ */}
        {view === 'diagram' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-400">schema</span>
              Card → Page Usage Diagram
            </h2>
            <p className="text-sm text-gray-400 mb-6">Click on a card to highlight which pages use it</p>

            {/* Card selector */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CARDS.map(card => (
                <button
                  key={card.name}
                  onClick={() => setSelectedCard(selectedCard === card.name ? null : card.name)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCard === card.name
                      ? 'bg-white/10 border-white/30 text-white shadow-lg scale-105'
                      : card.status === 'unused' ? 'border-white/5 text-gray-600 bg-white/[0.02]'
                      : card.status === 'duplicate' ? 'border-red-500/30 text-red-400 bg-red-500/5'
                      : 'border-white/10 text-gray-300 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                  style={selectedCard === card.name ? { borderColor: card.color, boxShadow: `0 0 20px ${card.color}30` } : {}}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: card.color }} />
                  {card.name}
                  {card.status === 'duplicate' && <span className="ml-1 text-[9px] text-red-400">(dup)</span>}
                  {card.status === 'unused' && <span className="ml-1 text-[9px] text-gray-500">(dead)</span>}
                </button>
              ))}
            </div>

            {/* Diagram Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {GROUPS.map(group => {
                const groupRoutes = filteredRoutes.filter(r => r.group === group);
                if (groupRoutes.length === 0) return null;
                return (
                  <div key={group} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2" style={{ backgroundColor: `${GROUP_COLORS[group]}10` }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: GROUP_COLORS[group] }}>{GROUP_ICONS[group]}</span>
                      <h3 className="text-sm font-bold" style={{ color: GROUP_COLORS[group] }}>{group}</h3>
                      <span className="text-[10px] text-gray-500 ml-auto">{groupRoutes.length} routes</span>
                    </div>
                    <div className="divide-y divide-white/[0.03]">
                      {groupRoutes.map(route => {
                        const isHighlighted = highlightedPages.includes(route.path);
                        return (
                          <div
                            key={route.path}
                            className={`px-4 py-3 flex items-start gap-3 transition-all ${
                              isHighlighted ? 'bg-blue-500/10' : selectedCard ? 'opacity-30' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <code className="text-[12px] font-mono text-gray-300">{route.path}</code>
                                {route.auth && (
                                  <span className="material-symbols-outlined text-amber-500 text-[12px]">lock</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">{route.label}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 shrink-0 max-w-[200px] justify-end">
                              {route.cards.length > 0 ? route.cards.map(c => {
                                const cardInfo = CARDS.find(ci => ci.name === c);
                                return (
                                  <span
                                    key={c}
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor: `${cardInfo?.color || '#6b7280'}15`,
                                      color: cardInfo?.color || '#6b7280',
                                      border: `1px solid ${cardInfo?.color || '#6b7280'}30`,
                                    }}
                                  >
                                    {c.replace(' (inline)', '').replace(' (similar)', '')}
                                  </span>
                                );
                              }) : (
                                <span className="text-[9px] text-gray-600">no cards</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            VIEW: All Routes
        ════════════════════════════════════════════════════════════════════ */}
        {view === 'routes' && (
          <div>
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">route</span>
              All Routes ({filteredRoutes.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-[11px] text-gray-400 font-bold uppercase">Route</th>
                    <th className="px-4 py-3 text-[11px] text-gray-400 font-bold uppercase">Label</th>
                    <th className="px-4 py-3 text-[11px] text-gray-400 font-bold uppercase">Group</th>
                    <th className="px-4 py-3 text-[11px] text-gray-400 font-bold uppercase">Type</th>
                    <th className="px-4 py-3 text-[11px] text-gray-400 font-bold uppercase">Auth</th>
                    <th className="px-4 py-3 text-[11px] text-gray-400 font-bold uppercase">Cards Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRoutes.map(r => (
                    <tr key={r.path} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-[12px] font-mono text-blue-300">{r.path}</code>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-300">{r.label}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${GROUP_COLORS[r.group]}20`, color: GROUP_COLORS[r.group] }}>{r.group}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-gray-400">{r.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        {r.auth ? <span className="material-symbols-outlined text-amber-500 text-[14px]">lock</span> : <span className="material-symbols-outlined text-emerald-500 text-[14px]">public</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.cards.length > 0 ? r.cards.map(c => (
                            <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-300">{c}</span>
                          )) : <span className="text-[10px] text-gray-600">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            VIEW: All Cards
        ════════════════════════════════════════════════════════════════════ */}
        {view === 'cards' && (
          <div>
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">dashboard</span>
              All Card Components ({CARDS.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CARDS.map(card => (
                <div
                  key={card.name}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    card.status === 'unused' ? 'border-white/5 opacity-50' :
                    card.status === 'duplicate' ? 'border-red-500/20' :
                    'border-white/10'
                  }`}
                  style={{ backgroundColor: `${card.color}05` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                        <h3 className="text-[15px] font-black">{card.name}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        card.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        card.status === 'duplicate' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {card.status === 'active' ? 'ACTIVE' : card.status === 'duplicate' ? 'DUPLICATE' : 'UNUSED'}
                      </span>
                    </div>

                    <code className="text-[10px] text-gray-500 font-mono block mb-3">{card.file}</code>
                    <p className="text-[12px] text-gray-400 mb-4">{card.purpose}</p>

                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Used in {card.usedInPages.length} pages:
                      </p>
                      {card.usedInPages.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {card.usedInPages.map(p => (
                            <code key={p} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5">{p}</code>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-red-400 font-bold">Not used anywhere</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
