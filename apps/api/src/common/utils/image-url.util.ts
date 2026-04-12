/**
 * Normalizes an image URL stored in the database.
 * Converts absolute localhost URLs to relative paths so the frontend
 * can prepend the correct API base for any environment.
 *
 * - Cloudinary / external URLs → pass through unchanged
 * - http://localhost:4000/uploads/xxx.jpg → /uploads/xxx.jpg
 * - Already relative /uploads/xxx.jpg → pass through
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already relative — good
  if (url.startsWith('/uploads/')) return url;

  // Absolute localhost URL — strip to relative
  const match = url.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)[^/]*(\/uploads\/.+)$/);
  if (match) return match[1];

  // External URL (Cloudinary, S3, etc.) — pass through
  return url;
}

/**
 * Normalizes all image URLs in a listing or any object with an `images` array.
 */
export function normalizeImages<T extends { images?: { url: string }[] }>(item: T): T {
  if (!item?.images) return item;
  return {
    ...item,
    images: item.images.map((img) => ({
      ...img,
      url: normalizeImageUrl(img.url) || img.url,
    })),
  };
}
