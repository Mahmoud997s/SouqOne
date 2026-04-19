'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentFilterEntry {
  label: string;                  // human-readable summary e.g. "تويوتا · 2020 · بنزين"
  params: Record<string, string>; // URL param overrides to apply on click
  tab: string;
  savedAt: number;
}

// ─── Models fetch + cache ─────────────────────────────────────────────────────

const MODELS_BASE = '/api/listings/models';

export function useModels(brand: string) {
  const cache = useRef<Record<string, string[]>>({});
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!brand) { setModels([]); return; }

    if (cache.current[brand]) {
      setModels(cache.current[brand]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`${MODELS_BASE}?brand=${encodeURIComponent(brand)}`)
      .then(r => r.json())
      .then((data: string[] | { models?: string[] }) => {
        if (cancelled) return;
        const list: string[] = Array.isArray(data) ? data : (data.models ?? []);
        cache.current[brand] = list;
        setModels(list);
      })
      .catch(() => { if (!cancelled) setModels([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [brand]);

  return { models, loading };
}

// ─── Recent filters per tab ───────────────────────────────────────────────────

const STORAGE_KEY = (tab: string) => `recent_filters_${tab || 'all'}`;
const MAX_RECENT = 3;

function readRecent(tab: string): RecentFilterEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(tab));
    return raw ? (JSON.parse(raw) as RecentFilterEntry[]) : [];
  } catch {
    return [];
  }
}

function writeRecent(tab: string, entries: RecentFilterEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY(tab), JSON.stringify(entries.slice(0, MAX_RECENT)));
  } catch { /* quota */ }
}

export function useRecentFilters(activeTab: string) {
  const [recents, setRecents] = useState<RecentFilterEntry[]>([]);

  // Load on tab change
  useEffect(() => {
    setRecents(readRecent(activeTab));
  }, [activeTab]);

  const saveRecent = useCallback((entry: Omit<RecentFilterEntry, 'savedAt'>) => {
    const next: RecentFilterEntry = { ...entry, savedAt: Date.now() };
    const existing = readRecent(activeTab);
    // dedupe by label
    const deduped = existing.filter(e => e.label !== next.label);
    const updated = [next, ...deduped].slice(0, MAX_RECENT);
    writeRecent(activeTab, updated);
    setRecents(updated);
  }, [activeTab]);

  const clearRecents = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY(activeTab));
    setRecents([]);
  }, [activeTab]);

  return { recents, saveRecent, clearRecents };
}

// ─── Build a human-readable label from active filter state ───────────────────

interface FilterSummaryInput {
  make: string; model: string; yearMin: string; yearMax: string;
  fuel: string; cond: string; trans: string; lt: string;
  gov: string; minP: string; maxP: string;
  busType: string; partCat: string; svcType: string;
  jobType: string; tripType: string; trType: string;
}

const LABEL_MAP: Record<string, string> = {
  SALE: 'للبيع', RENTAL: 'إيجار', WANTED: 'مطلوب',
  NEW: 'جديد', USED: 'مستعمل', LIKE_NEW: 'شبه جديد',
  PETROL: 'بنزين', DIESEL: 'ديزل', HYBRID: 'هجين', ELECTRIC: 'كهربائي',
  AUTOMATIC: 'أوتوماتيك', MANUAL: 'يدوي',
  MINI_BUS: 'ميني باص', MEDIUM_BUS: 'متوسط', LARGE_BUS: 'كبير',
  ENGINE: 'محرك', BODY: 'هيكل', ELECTRICAL: 'كهربائيات',
  MAINTENANCE: 'صيانة', CLEANING: 'تنظيف',
  OFFERING: 'عرض عمل', HIRING: 'توظيف',
  BUS_SUBSCRIPTION: 'اشتراك باص', TOURISM: 'سياحة',
  CARGO: 'شحن', DELIVERY: 'توصيل',
};

function l(v: string) { return LABEL_MAP[v] ?? v; }

export function buildFilterLabel(s: FilterSummaryInput): string {
  const parts: string[] = [];
  if (s.make) parts.push(s.make);
  if (s.model) parts.push(s.model);
  if (s.yearMin && s.yearMax) parts.push(`${s.yearMin}-${s.yearMax}`);
  else if (s.yearMin) parts.push(`من ${s.yearMin}`);
  else if (s.yearMax) parts.push(`إلى ${s.yearMax}`);
  if (s.fuel) parts.push(l(s.fuel));
  if (s.trans) parts.push(l(s.trans));
  if (s.cond) parts.push(l(s.cond));
  if (s.lt) parts.push(l(s.lt));
  if (s.busType) parts.push(l(s.busType));
  if (s.partCat) parts.push(l(s.partCat));
  if (s.svcType) parts.push(l(s.svcType));
  if (s.jobType) parts.push(l(s.jobType));
  if (s.tripType) parts.push(l(s.tripType));
  if (s.trType) parts.push(l(s.trType));
  if (s.gov) parts.push(s.gov);
  if (s.minP && s.maxP) parts.push(`${Number(s.minP).toLocaleString('ar-EG')}-${Number(s.maxP).toLocaleString('ar-EG')} ر.ع`);
  return parts.join(' · ') || 'بحث بدون فلاتر';
}
