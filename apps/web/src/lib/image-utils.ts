import { API_BASE } from './config';

/**
 * Normalizes an image URL to ensure it's a full, loadable URL.
 * - Relative paths (e.g. /uploads/...) get the API base prepended
 * - localhost URLs get normalized to match the configured API base
 * - Already-full URLs (https://...) pass through unchanged
 */
export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already a full non-localhost URL (e.g. Cloudinary, Unsplash)
  if (url.startsWith('https://') && !url.includes('localhost')) {
    return url;
  }

  // Relative path — prepend API base
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${path}`;
  }

  // Full URL with localhost — replace with configured API base
  // This handles cases where DB has http://localhost:4000/uploads/... but env is different
  const uploadsMatch = url.match(/https?:\/\/[^/]+(\/.*)$/);
  if (uploadsMatch && url.includes('/uploads/')) {
    return `${API_BASE}${uploadsMatch[1]}`;
  }

  return url;
}
