import type { Metadata } from 'next';
import { API_BASE } from '@/lib/config';
import { getImageUrl } from '@/lib/image-utils';

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
  const { id } = await params;
  const car = await fetchCarData(id);

  if (!car) {
    return {
      title: 'إعلان غير موجود | سوق وان',
    };
  }

  const title = `${car.title} | سوق وان`;
  const price = car.price ? `${Number(car.price).toLocaleString('en-US')} ر.ع.` : '';
  const description = `${car.title} ${car.year ? `- ${car.year}` : ''} ${price} - ${car.mileage ? `${car.mileage.toLocaleString('en-US')} كم` : ''} - سوق وان عمان`;

  const primaryImage = car.images?.find((i: { isPrimary?: boolean }) => i.isPrimary) ?? car.images?.[0];
  const imageUrl = primaryImage ? getImageUrl(primaryImage.url) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_OM',
      siteName: 'سوق وان',
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
