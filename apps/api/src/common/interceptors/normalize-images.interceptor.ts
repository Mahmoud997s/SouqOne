import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Global interceptor that normalizes all image URLs in API responses.
 * Converts absolute localhost URLs (http://localhost:4000/uploads/xxx.jpg)
 * to relative paths (/uploads/xxx.jpg) so the frontend can resolve them
 * correctly for any environment.
 */
@Injectable()
export class NormalizeImagesInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.normalize(data)));
  }

  private normalize(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.map((item) => this.normalize(item));

    if (typeof data === 'object') {
      // If this object has a 'url' key that looks like a localhost upload URL, fix it
      const result: any = {};
      for (const key of Object.keys(data)) {
        const val = data[key];
        if (
          key === 'url' &&
          typeof val === 'string' &&
          val.includes('/uploads/') &&
          /^https?:\/\/(?:localhost|127\.0\.0\.1)/.test(val)
        ) {
          const match = val.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/);
          result[key] = match ? match[1] : val;
        } else if (
          (key === 'image' || key === 'imageUrl' || key === 'avatarUrl' || key === 'mediaUrl') &&
          typeof val === 'string' &&
          val.includes('/uploads/') &&
          /^https?:\/\/(?:localhost|127\.0\.0\.1)/.test(val)
        ) {
          const match = val.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/);
          result[key] = match ? match[1] : val;
        } else {
          result[key] = this.normalize(val);
        }
      }
      return result;
    }

    return data;
  }
}
