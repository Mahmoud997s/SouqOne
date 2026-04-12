import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

const URL_KEYS = new Set(['url', 'image', 'imageUrl', 'avatarUrl', 'mediaUrl']);
const LOCALHOST_RE = /^https?:\/\/(?:localhost|127\.0\.0\.1)[^/]*(\/uploads\/.+)$/;

/**
 * Global interceptor that normalizes image URLs in API responses.
 * Converts absolute localhost URLs (http://localhost:4000/uploads/xxx.jpg)
 * to relative paths (/uploads/xxx.jpg) so the frontend can resolve them
 * correctly for any environment.
 *
 * IMPORTANT: Mutates in-place to preserve Prisma Decimal, Date, and other
 * class instances that would break if spread into plain objects.
 */
@Injectable()
export class NormalizeImagesInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => { this.walk(data); return data; }));
  }

  private stripLocalhost(val: string): string {
    const m = LOCALHOST_RE.exec(val);
    return m ? m[1] : val;
  }

  private walk(data: any): void {
    if (data === null || data === undefined || typeof data !== 'object') return;

    if (Array.isArray(data)) {
      for (const item of data) this.walk(item);
      return;
    }

    // Skip known non-traversable types (Date, Buffer, RegExp, Decimal, etc.)
    if (data instanceof Date || data instanceof RegExp) return;
    if (typeof data.toFixed === 'function') return; // Decimal / BigNumber
    if (Buffer.isBuffer(data)) return;

    for (const key of Object.keys(data)) {
      const val = data[key];
      if (typeof val === 'string' && URL_KEYS.has(key) && val.includes('/uploads/')) {
        data[key] = this.stripLocalhost(val);
      } else if (typeof val === 'object' && val !== null) {
        this.walk(val);
      }
    }
  }
}
