'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/**
 * Legacy route — redirects to /sale/car/[id] which is the canonical detail page.
 */
export default function ListingDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const tp = useTranslations('pages');

  useEffect(() => {
    router.replace(`/sale/car/${params.id}`);
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-on-surface-variant">
      <p className="text-sm font-medium">{tp('redirecting')}</p>
    </div>
  );
}
