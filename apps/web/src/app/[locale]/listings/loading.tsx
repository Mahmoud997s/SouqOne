import { ListingSkeleton } from '@/components/loading-skeleton';
import { Navbar } from '@/components/layout/navbar';

export default function ListingsLoading() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        <div className="animate-pulse space-y-4 mb-8">
          <div className="h-8 w-48 bg-surface-container-low rounded-lg" />
          <div className="h-4 w-32 bg-surface-container-low rounded-lg" />
        </div>
        <ListingSkeleton count={8} />
      </main>
    </>
  );
}
