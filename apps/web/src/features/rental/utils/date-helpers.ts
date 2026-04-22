/**
 * Date helper utilities for the rental calendar and booking components.
 * Pure functions — no external dependencies (no date-fns).
 */

export const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDate(d: Date): string {
  return `${d.getDate()} / ${d.getMonth() + 1} / ${d.getFullYear()}`;
}

export function formatShort(d: Date): string {
  return `${d.getDate()} ${MONTHS_AR[d.getMonth()]}`;
}
