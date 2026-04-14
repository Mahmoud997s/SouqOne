import type { Metadata } from 'next';
import { API_BASE } from '@/lib/config';
import { getImageUrl } from '@/lib/image-utils';
import { getTranslations } from 'next-intl/server';

interface CarDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

async function fetchCarData(id: string) {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CarDetailLayoutProps): Promise<Metadata> {
  const { id, locale } = await params;
  const car = await fetchCarData(id);
  const tp = await getTranslations({ locale, namespace: 'pages' });

  if (!car) {
    return {
      title: tp('carLayoutNotFound'),
    };
  }

  const siteName = tp('layoutSiteName');
  const currency = tp('carLayoutCurrency');
  const kmLabel = tp('carLayoutKm');
  const title = `${car.title} | ${siteName}`;
  const price = car.price ? `${Number(car.price).toLocaleString('en-US')} ${currency}` : '';
  const description = `${car.title} ${car.year ? `- ${car.year}` : ''} ${price} - ${car.mileage ? `${car.mileage.toLocaleString('en-US')} ${kmLabel}` : ''} - ${siteName}`;

  const primaryImage = car.images?.find((i: { isPrimary?: boolean }) => i.isPrimary) ?? car.images?.[0];
  const imageUrl = primaryImage ? getImageUrl(primaryImage.url) : undefined;

  const altLocale = locale === 'ar' ? 'en' : 'ar';

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/cars/${id}`,
      languages: {
        [locale]: `/${locale}/cars/${id}`,
        [altLocale]: `/${altLocale}/cars/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'ar' ? 'ar_OM' : 'en_OM',
      siteName,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: car.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default function CarDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
