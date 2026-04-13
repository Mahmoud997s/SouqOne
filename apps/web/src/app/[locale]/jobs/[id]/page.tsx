'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useJob, useApplyToJob, useDeleteJob, useCreateConversation } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { SellerCard } from '@/components/seller-card';
import { employmentLabels } from '@/lib/constants/jobs';

const jobTypeLabels: Record<string, { label: string; color: string }> = {
  OFFERING: { label: 'يبحث عن عمل', color: 'bg-brand-green/10 text-brand-green' },
  HIRING: { label: 'يبحث عن سائق', color: 'bg-primary/10 text-primary' },
};


const salaryPeriodLabels: Record<string, string> = {
  DAILY: '/يوم',
  MONTHLY: '/شهر',
  YEARLY: '/سنة',
  NEGOTIABLE: 'قابل للتفاوض',
};

const licenseLabels: Record<string, string> = {
  LIGHT: 'خفيفة',
  HEAVY: 'ثقيلة',
  TRANSPORT: 'نقل',
  BUS: 'حافلات',
  MOTORCYCLE: 'دراجة نارية',
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const { addToast } = useToast();

  const { data: job, isLoading, isError } = useJob(id);
  const applyMutation = useApplyToJob();
  const deleteMutation = useDeleteJob();
  const createConv = useCreateConversation();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  const isOwner = user && job?.user.id === user.id;

  function handleMessage() {
    requireAuth(async () => {
      if (!job) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'JOB', entityId: job.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  function handleApply() {
    requireAuth(async () => {
      try {
        await applyMutation.mutateAsync({ jobId: id, message: applyMessage || undefined });
        addToast('success', 'تم تقديم طلبك بنجاح!');
        setShowApplyModal(false);
        setApplyMessage('');
      } catch (err: any) {
        addToast('error', err?.message || 'فشل في تقديم الطلب');
      }
    }, 'سجّل الدخول لتقديم طلب');
  }

  async function handleDelete() {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      await deleteMutation.mutateAsync(id);
      addToast('success', 'تم حذف الإعلان');
      router.push('/jobs/my');
    } catch (err: any) {
      addToast('error', err?.message || 'فشل في الحذف');
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="h-40 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447]" />
          <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-16">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-surface-container-low rounded w-2/3" />
              <div className="h-4 bg-surface-container-low rounded w-1/3" />
              <div className="h-64 bg-surface-container-low rounded" />
            </div>
          </main>
        </div>
      </>
    );
  }

  if (isError || !job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-28">
          <main className="max-w-5xl mx-auto px-4 md:px-8 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">error</span>
            <p className="text-xl font-bold mb-4">الوظيفة غير موجودة</p>
            <Link href="/jobs" className="bg-primary text-on-primary px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">العودة للوظائف</Link>
          </main>
        </div>
      </>
    );
  }

  const typeInfo = jobTypeLabels[job.jobType] ?? { label: job.jobType, color: 'bg-gray-100 text-gray-600' };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <Link href="/jobs" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">work</span> وظائف السائقين
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span className="text-white font-bold truncate max-w-xs">{job.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs font-black px-3 py-1 ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant text-xs font-black px-3 py-1">
                      {employmentLabels[job.employmentType] ?? job.employmentType}
                    </span>
                    {job.status === 'CLOSED' && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-black px-3 py-1">مغلق</span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-on-surface mb-3">{job.title}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                      {job.governorate}{job.city ? ` - ${job.city}` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      {job.viewCount} مشاهدة
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      {new Date(job.createdAt).toLocaleDateString('ar-OM')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary */}
              {job.salary && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="p-6">
                    <p className="text-sm text-on-surface-variant mb-1">الراتب</p>
                    <p className="text-3xl font-black text-primary">
                      {Number(job.salary).toLocaleString('en-US')}{' '}
                      <span className="text-base font-bold text-on-surface-variant">ر.ع.{job.salaryPeriod ? salaryPeriodLabels[job.salaryPeriod] : ''}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <h2 className="font-black text-on-surface">الوصف</h2>
                </div>
                <div className="p-6">
                  <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">checklist</span>
                  <h2 className="font-black text-on-surface">المتطلبات والتفاصيل</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {job.licenseTypes.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">badge</span>
                        <div>
                          <p className="text-xs text-on-surface-variant">نوع الرخصة</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.licenseTypes.map((lt) => (
                              <span key={lt} className="bg-primary/10 dark:bg-primary/20 text-primary text-xs font-black px-2.5 py-0.5">
                                {licenseLabels[lt] ?? lt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {job.experienceYears != null && (
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">history</span>
                        <div>
                          <p className="text-xs text-on-surface-variant">سنوات الخبرة</p>
                          <p className="font-black text-on-surface">{job.experienceYears} سنة</p>
                        </div>
                      </div>
                    )}
                    {(job.minAge || job.maxAge) && (
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">cake</span>
                        <div>
                          <p className="text-xs text-on-surface-variant">العمر المطلوب</p>
                          <p className="font-black text-on-surface">
                            {job.minAge && job.maxAge ? `${job.minAge} - ${job.maxAge} سنة` : job.minAge ? `${job.minAge}+ سنة` : `حتى ${job.maxAge} سنة`}
                          </p>
                        </div>
                      </div>
                    )}
                    {job.languages.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">translate</span>
                        <div>
                          <p className="text-xs text-on-surface-variant">اللغات</p>
                          <p className="font-black text-on-surface">{job.languages.join('، ')}</p>
                        </div>
                      </div>
                    )}
                    {job.nationality && (
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">flag</span>
                        <div>
                          <p className="text-xs text-on-surface-variant">الجنسية</p>
                          <p className="font-black text-on-surface">{job.nationality}</p>
                        </div>
                      </div>
                    )}
                    {job.vehicleTypes.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">directions_car</span>
                        <div>
                          <p className="text-xs text-on-surface-variant">أنواع المركبات</p>
                          <p className="font-black text-on-surface">{job.vehicleTypes.join('، ')}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">garage</span>
                      <div>
                        <p className="text-xs text-on-surface-variant">لديه سيارة خاصة</p>
                        <p className="font-black text-on-surface">{job.hasOwnVehicle ? 'نعم' : 'لا'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Card */}
              <SellerCard
                title="المعلن"
                name={job.user.displayName || job.user.username}
                avatarUrl={job.user.avatarUrl}
                location={job.user.governorate}
                phone={job.contactPhone}
                memberSince={job.user.createdAt}
                onShare={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: job.title, url });
                  else navigator.clipboard.writeText(url);
                }}
              />

              {/* Contact Info */}
              {(job.contactPhone || job.contactEmail || job.whatsapp) && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">contact_phone</span>
                    <h3 className="font-black text-on-surface text-sm">معلومات التواصل</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {job.contactPhone && (
                      <a href={`tel:${job.contactPhone}`} className="flex items-center gap-2 w-full py-3 bg-primary text-on-primary font-black text-sm justify-center hover:brightness-110 transition-all">
                        <span className="material-symbols-outlined text-lg">call</span>
                        {job.contactPhone}
                      </a>
                    )}
                    {job.whatsapp && (
                      <a
                        href={`https://wa.me/${job.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black text-sm justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">chat</span>
                        واتساب
                      </a>
                    )}
                    {job.contactEmail && (
                      <a href={`mailto:${job.contactEmail}`} className="flex items-center gap-2 w-full py-3 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-black text-sm justify-center hover:bg-surface-container dark:hover:bg-surface-container-highest transition-colors">
                        <span className="material-symbols-outlined text-lg">mail</span>
                        {job.contactEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {isOwner ? (
                  <>
                    <Link href={`/jobs/my`} className="bg-primary text-on-primary w-full py-3.5 text-sm text-center block font-black hover:brightness-110 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">edit</span>
                      إدارة إعلاناتي
                    </Link>
                    <button onClick={handleDelete} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3.5 text-sm font-black hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">delete</span>
                      حذف الإعلان
                    </button>
                  </>
                ) : job.status === 'ACTIVE' ? (
                  <>
                    <button
                      onClick={() => requireAuth(() => setShowApplyModal(true), 'سجّل الدخول لتقديم طلب')}
                      className="bg-primary text-on-primary w-full py-3.5 text-sm font-black hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                      تقديم طلب
                    </button>
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="bg-on-surface text-surface w-full py-3.5 text-sm font-black hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">chat</span>
                      {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                    </button>
                  </>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-center py-3.5 text-sm font-black">
                    هذا الإعلان مغلق
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-black mb-4 text-on-surface">تقديم طلب</h3>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="اكتب رسالة قصيرة (اختياري)..."
              className="w-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/30 dark:border-outline-variant/40 p-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm min-h-[120px] resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="bg-primary text-on-primary hover:brightness-110 flex-1 py-3 text-sm font-black disabled:opacity-50 transition-all"
              >
                {applyMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant px-6 py-3 text-sm font-black hover:text-primary transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
