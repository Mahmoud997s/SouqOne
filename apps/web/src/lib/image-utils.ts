import { API_BASE } from './config';

/**
 * Normalizes an image URL to ensure it's a full, loadable URL.
 * - Full external URLs (Cloudinary, S3, etc.) pass through unchanged
 * - Relative paths (/uploads/...) get the API base prepended
 * - localhost URLs get rewritten to the configured API base
 * - blob: URLs (local previews) pass through unchanged
 */
export function getImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null;

  // blob: URLs (local file previews in the uploader) — pass through
  if (url.startsWith('blob:')) return url;

  // Already a full external URL (Cloudinary, S3, CDN, etc.) — pass through
  // Matches both http:// and https:// as long as it's NOT localhost/127.0.0.1
  if (/^https?:\/\//.test(url) && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url;
  }

  // Relative path — prepend API base
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${path}`;
  }

  // Full URL with localhost/127.0.0.1 — rewrite host to configured API base
  const uploadsMatch = url.match(/https?:\/\/[^/]+(\/uploads\/.*)$/);
  if (uploadsMatch) {
    return `${API_BASE}${uploadsMatch[1]}`;
  }

  // Any other localhost URL (non-uploads path) — rewrite host
  const anyPathMatch = url.match(/https?:\/\/(?:localhost|127\.0\.0\.1)[^/]*(\/.*)?$/);
  if (anyPathMatch) {
    return `${API_BASE}${anyPathMatch[1] || ''}`;
  }

  return url;
}
