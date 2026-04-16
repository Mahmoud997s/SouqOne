'use client';

import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useDriver, useCreateConversation, useInviteDriver, useMyJobs, useDriverReviews } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useRequireJobProfile } from '@/hooks/use-require-job-profile';
import { useToast } from '@/components/toast';
import { getImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

const LICENSE_LABELS: Record<string, string> = {
  LIGHT: 'خفيفة', HEAVY: 'ثقيلة', TRANSPORT: 'نقل', BUS: 'حافلات', MOTORCYCLE: 'دراجة نارية',
};
const VEHICLE_LABELS: Record<string, string> = {
  SEDAN: 'سيدان', SUV: 'دفع رباعي', LIGHT_TRUCK: 'شاحنة خفيفة', HEAVY_TRUCK: 'شاحنة ثقيلة',
  BUS: 'حافلة', VAN: 'فان', PICKUP: 'بيك أب', LIMO: 'ليموزين',
};
const LANG_LABELS: Record<string, string> = {
  ARABIC: 'العربية', ENGLISH: 'الإنجليزية', URDU: 'الأردية', HINDI: 'الهندية',
  BENGALI: 'البنغالية', FILIPINO: 'الفلبينية',
};

export default function DriverProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requireProfile } = useRequireJobProfile();
  const { addToast } = useToast();
  const { data: driver, isLoading, isError } = useDriver(id);
  const createConv = useCreateConversation();
  const inviteDriver = useInviteDriver();
  const { data: myJobsData } = useMyJobs();
  const myJobs = myJobsData?.items?.filter((j) => j.status === 'ACTIVE') ?? [];

  async function handleInvite() {
    requireProfile('employer', async () => {
      if (!driver || myJobs.length === 0) {
        addToast('error', 'يجب أن يكون لديك وظيفة نشطة لدعوة سائق');
        return;
      }
      try {
        await inviteDriver.mutateAsync({ jobId: myJobs[0].id, driverId: driver.userId });
        addToast('success', 'تم إرسال الدعوة بنجاح');
      } catch (err: any) {
        addToast('error', err?.message || 'حدث خطأ أثناء إرسال الدعوة');
      }
    });
  }

  function handleMessage() {
    requireProfile('any', async () => {
      if (!driver) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'JOB', entityId: driver.id });
        router.push(`/messages/${conv.id}`);
      } catch {
        addToast('error', 'تعذر بدء المحادثة');
      }
    });
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="h-40 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447]" />
          <main className="max-w-4xl mx-auto px-4 md:px-8 -mt-16">
            <div className="animate-pulse space-y-6">
              <div className="h-24 w-24 bg-surface-container-low rounded-full" />
              <div className="h-8 bg-surface-container-low rounded w-1/3" />
              <div className="h-64 bg-surface-container-low rounded" />
            </div>
          </main>
        </div>
      </>
    );
  }

  if (isError || !driver) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-28">
          <main className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">error</span>
            <p className="text-xl font-bold mb-4">بروفايل السائق غير موجود</p>
            <Link href="/jobs/drivers" className="bg-primary text-on-primary px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">
              العودة لقائمة السائقين
            </Link>
          </main>
        </div>
      </>
    );
  }

  const isOwnProfile = user?.id === driver.userId;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-4xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span className="material-symbols-outlined icon-flip text-xs">chevron_left</span>
            <Link href="/jobs/drivers" className="hover:text-white transition-colors">السائقون</Link>
            <span className="material-symbols-outlined icon-flip text-xs">chevron_left</span>
            <span className="text-white font-bold truncate max-w-xs">{driver.user.displayName || driver.user.username}</span>
          </nav>

          {/* Profile Header */}
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm mb-6">
            <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-surface-container-low shrink-0">
                {driver.user.avatarUrl ? (
                  <Image src={getImageUrl(driver.user.avatarUrl) ?? ''} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">person</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-on-surface">{driver.user.displayName || driver.user.username}</h1>
                  {driver.isVerified && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      موثّق
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {driver.governorate}{driver.city ? ` - ${driver.city}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {driver.isAvailable ? (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">متاح للعمل</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">غير متاح حاليا</span>
                  )}
                  {driver.averageRating && (
                    <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">star</span>
                      {driver.averageRating.toFixed(1)} ({driver.reviewCount} تقييم)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!isOwnProfile && (
                  <>
                    {myJobs.length > 0 && (
                      <button onClick={handleInvite} disabled={inviteDriver.isPending} className="bg-brand-green text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition flex items-center gap-2 disabled:opacity-50">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        ادعوه لوظيفتك
                      </button>
                    )}
                    <button onClick={handleMessage} className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">chat</span>
                      مراسلة
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              {driver.bio && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-extrabold text-on-surface">نبذة</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{driver.bio}</p>
                  </div>
                </div>
              )}

              {/* License Types */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <h2 className="font-extrabold text-on-surface">الرخص</h2>
                </div>
                <div className="p-6 flex flex-wrap gap-2">
                  {driver.licenseTypes.map((lt) => (
                    <span key={lt} className="bg-primary/10 text-primary font-bold text-sm px-3 py-1.5 rounded-lg">
                      {LICENSE_LABELS[lt] || lt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vehicle Types */}
              {driver.vehicleTypes.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">directions_car</span>
                    <h2 className="font-extrabold text-on-surface">المركبات</h2>
                  </div>
                  <div className="p-6 flex flex-wrap gap-2">
                    {driver.vehicleTypes.map((vt) => (
                      <span key={vt} className="bg-surface-container-low text-on-surface-variant font-bold text-sm px-3 py-1.5 rounded-lg">
                        {VEHICLE_LABELS[vt] || vt}
                      </span>
                    ))}
                    {driver.hasOwnVehicle && (
                      <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        لديه مركبة خاصة
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h2 className="font-extrabold text-on-surface">المعلومات</h2>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  {driver.experienceYears != null && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">سنوات الخبرة</span>
                      <span className="font-bold">{driver.experienceYears} سنة</span>
                    </div>
                  )}
                  {driver.nationality && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">الجنسية</span>
                      <span className="font-bold">{driver.nationality}</span>
                    </div>
                  )}
                  {driver.languages.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">اللغات</span>
                      <span className="font-bold">{driver.languages.map((l) => LANG_LABELS[l] || l).join('، ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">انضم</span>
                    <span className="font-bold">{new Date(driver.createdAt).toLocaleDateString('ar-OM')}</span>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              {(driver.contactPhone || driver.whatsapp) && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">call</span>
                    <h2 className="font-extrabold text-on-surface">التواصل</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    {driver.contactPhone && (
                      <a href={`tel:${driver.contactPhone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">phone</span>
                        {driver.contactPhone}
                      </a>
                    )}
                    {driver.whatsapp && (
                      <a href={`https://wa.me/${driver.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                        <span className="material-symbols-outlined text-sm">chat</span>
                        واتساب
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Reviews Section */}
          {driver && <DriverReviewsSection profileId={driver.id} />}
        </main>
      </div>
      <Footer />
    </>
  );
}

function DriverReviewsSection({ profileId }: { profileId: string }) {
  const { data, isLoading } = useDriverReviews(profileId);

  if (isLoading) return null;
  if (!data || data.items.length === 0) return null;

  return (
    <div className="mt-6 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">reviews</span>
          <h2 className="font-extrabold text-on-surface">التقييمات</h2>
        </div>
        <span className="text-xs text-on-surface-variant font-bold">{data.meta.total} تقييم</span>
      </div>
      <div className="divide-y divide-outline-variant/10">
        {data.items.map((review) => (
          <div key={review.id} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {review.reviewer.displayName?.[0] || review.reviewer.username[0]}
              </div>
              <div>
                <p className="text-sm font-bold">{review.reviewer.displayName || review.reviewer.username}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-xs ${i < review.rating ? 'text-amber-500' : 'text-on-surface-variant/20'}`}>
                      star
                    </span>
                  ))}
                  <span className="text-xs text-on-surface-variant mr-2">
                    {new Date(review.createdAt).toLocaleDateString('ar-OM')}
                  </span>
                </div>
              </div>
            </div>
            {review.comment && <p className="text-sm text-on-surface-variant">{review.comment}</p>}
            {review.reply && (
              <div className="mt-2 mr-8 bg-surface-container-low rounded-lg p-3">
                <p className="text-xs font-bold text-primary mb-1">رد السائق</p>
                <p className="text-xs text-on-surface-variant">{review.reply.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
