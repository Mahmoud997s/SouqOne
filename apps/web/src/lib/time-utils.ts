export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days === 1) return 'أمس';
  if (days < 7) return `منذ ${days} أيام`;
  if (weeks === 1) return 'منذ أسبوع';
  if (weeks < 4) return `منذ ${weeks} أسابيع`;
  if (months === 1) return 'منذ شهر';
  if (months < 12) return `منذ ${months} أشهر`;
  return new Date(dateStr).toLocaleDateString('ar-OM');
}
