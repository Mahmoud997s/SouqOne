import { API_BASE } from './config';

/**
 * Server-side fetch utility for use in Server Components.
 * No auth token — public endpoints only.
 * Includes Next.js cache/revalidation options.
 */
export async function serverFetch<T>(
  path: string,
  options?: { revalidate?: number | false; tags?: string[] },
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}/api/v1${normalizedPath}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    next: {
      revalidate: options?.revalidate ?? 60,
      tags: options?.tags,
    },
  });

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}
