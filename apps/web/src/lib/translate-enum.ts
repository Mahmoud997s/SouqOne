/**
 * Safe enum translation helper.
 * Returns the translated string from the map, or the raw value if not found, or '—' if null/undefined.
 */
export function translateEnum(
  map: Record<string, string> | undefined,
  value?: string | null
): string {
  if (!value) return '—';
  return map?.[value] ?? value; // fallback = raw value (never crashes)
}
