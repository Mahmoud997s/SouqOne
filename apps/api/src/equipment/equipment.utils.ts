/**
 * Shared utilities for the Equipment module.
 */

export const USER_SELECT = {
  id: true, username: true, displayName: true,
  avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true,
} as const;

export const MAX_IMAGES_PER_LISTING = 10;

/**
 * Generate a URL-safe slug that supports Arabic characters.
 * Falls back to a cuid-style slug if the title produces an empty base.
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')   // keep Arabic, alphanumeric, spaces, hyphens
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const suffix = Date.now().toString(36);
  return base ? `${base}-${suffix}` : suffix;
}
