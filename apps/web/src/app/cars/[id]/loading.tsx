import { Navbar } from '@/components/layout/navbar';

export default function CarDetailsLoading() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-primary via-primary-container to-brand-navy" />
        <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-16">
          <div className="animate-pulse space-y-6">
            {/* Image skeleton */}
            <div className="aspect-[16/10] bg-surface-container-low rounded-lg" />
            {/* Title */}
            <div className="h-8 w-3/4 bg-surface-container-low rounded-lg" />
            {/* Specs grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-surface-container-low rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
