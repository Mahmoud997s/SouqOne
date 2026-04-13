'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

/**
 * Legacy route — redirects to /cars/[id] which is the canonical detail page.
 */
export default function ListingDetailRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/cars/${params.id}`);
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-on-surface-variant">
      <p className="text-sm font-medium">جارٍ التحويل...</p>
    </div>
  );
}
