'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useJob, useApplyToJob, useDeleteJob, useCreateConversation } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
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
        <main className="pt-28 pb-16 max-w-4xl mx-auto px-4 md:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-container-low rounded-xl w-2/3" />
            <div className="h-4 bg-surface-container-low rounded w-1/3" />
            <div className="h-64 bg-surface-container-low rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  if (isError || !job) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">error</span>
          <p className="text-xl font-bold mb-4">الوظيفة غير موجودة</p>
          <Link href="/jobs" className="bg-primary text-on-primary px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">العودة للوظائف</Link>
        </main>
      </>
    );
  }

  const typeInfo = jobTypeLabels[job.jobType] ?? { label: job.jobType, color: 'bg-gray-100 text-gray-600' };

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-4xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-primary">وظائف السائقين</Link>
          <span>/</span>
          <span className="text-on-surface font-bold truncate max-w-xs">{job.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <span className="bg-surface-container-low text-on-surface-variant text-xs px-3 py-1 rounded-full">
                  {employmentLabels[job.employmentType] ?? job.employmentType}
                </span>
                {job.status === 'CLOSED' && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">مغلق</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-on-surface mb-3">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">location_on</span>
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

            {/* Salary */}
            {job.salary && (
              <div className="bg-primary/5 border border-primary/20 p-5">
                <p className="text-sm text-on-surface-variant mb-1">الراتب</p>
                <p className="text-3xl font-black text-primary">
                  {Number(job.salary).toLocaleString('en-US')}{' '}
                  <span className="text-base font-bold">ر.ع.{job.salaryPeriod ? salaryPeriodLabels[job.salaryPeriod] : ''}</span>
                </p>
              </div>
            )}

            {/* Description */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                الوصف
              </h2>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">checklist</span>
                المتطلبات والتفاصيل
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {job.licenseTypes.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">badge</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">نوع الرخصة</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.licenseTypes.map((lt) => (
                          <span key={lt} className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                            {licenseLabels[lt] ?? lt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {job.experienceYears != null && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">history</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">سنوات الخبرة</p>
                      <p className="font-bold">{job.experienceYears} سنة</p>
                    </div>
                  </div>
                )}
                {(job.minAge || job.maxAge) && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">cake</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">العمر المطلوب</p>
                      <p className="font-bold">
                        {job.minAge && job.maxAge ? `${job.minAge} - ${job.maxAge} سنة` : job.minAge ? `${job.minAge}+ سنة` : `حتى ${job.maxAge} سنة`}
                      </p>
                    </div>
                  </div>
                )}
                {job.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">translate</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">اللغات</p>
                      <p className="font-bold">{job.languages.join('، ')}</p>
                    </div>
                  </div>
                )}
                {job.nationality && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">flag</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">الجنسية</p>
                      <p className="font-bold">{job.nationality}</p>
                    </div>
                  </div>
                )}
                {job.vehicleTypes.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">directions_car</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">أنواع المركبات</p>
                      <p className="font-bold">{job.vehicleTypes.join('، ')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant mt-0.5">garage</span>
                  <div>
                    <p className="text-xs text-on-surface-variant">لديه سيارة خاصة</p>
                    <p className="font-bold">{job.hasOwnVehicle ? 'نعم' : 'لا'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-5">
              <div className="flex items-center gap-3 mb-4">
                {job.user.avatarUrl ? (
                  <img src={job.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-on-surface">{job.user.displayName || job.user.username}</p>
                  {job.user.governorate && (
                    <p className="text-xs text-on-surface-variant">{job.user.governorate}</p>
                  )}
                </div>
              </div>
              {job.user.createdAt && (
                <p className="text-xs text-on-surface-variant">
                  عضو منذ {new Date(job.user.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long' })}
                </p>
              )}
            </div>

            {/* Contact Info */}
            {(job.contactPhone || job.contactEmail || job.whatsapp) && (
              <div className="bg-surface-container-lowest border border-outline-variant/10 p-5 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">contact_phone</span>
                  معلومات التواصل
                </h3>
                {job.contactPhone && (
                  <a href={`tel:${job.contactPhone}`} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">call</span>
                    {job.contactPhone}
                  </a>
                )}
                {job.whatsapp && (
                  <a
                    href={`https://wa.me/${job.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#25D366] text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#25D366]/90 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    واتساب
                  </a>
                )}
                {job.contactEmail && (
                  <a href={`mailto:${job.contactEmail}`} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">mail</span>
                    {job.contactEmail}
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isOwner ? (
                <>
                  <Link href={`/jobs/my`} className="bg-primary text-on-primary w-full py-3 text-sm text-center block font-black hover:brightness-110 transition-colors">
                    <span className="material-symbols-outlined text-lg align-middle ml-1">edit</span>
                    إدارة إعلاناتي
                  </Link>
                  <button onClick={handleDelete} className="w-full bg-red-50 text-red-600 rounded-xl py-3 text-sm font-bold hover:bg-red-100 transition-colors">
                    <span className="material-symbols-outlined text-lg align-middle ml-1">delete</span>
                    حذف الإعلان
                  </button>
                </>
              ) : job.status === 'ACTIVE' ? (
                <>
                  <button
                    onClick={() => requireAuth(() => setShowApplyModal(true), 'سجّل الدخول لتقديم طلب')}
                    className="bg-primary text-on-primary w-full py-3 text-sm font-black hover:brightness-110 transition-colors shadow-ambient"
                  >
                    <span className="material-symbols-outlined text-lg align-middle ml-1">send</span>
                    تقديم طلب
                  </button>
                  <button onClick={handleMessage} disabled={createConv.isPending}
                    className="bg-on-surface text-surface w-full py-3 text-sm font-black hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg align-middle ml-1">chat</span>
                    {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                  </button>
                </>
              ) : (
                <div className="bg-red-50 text-red-700 text-center rounded-xl py-3 text-sm font-bold">
                  هذا الإعلان مغلق
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 w-full max-w-md" dir="rtl">
            <h3 className="text-lg font-bold mb-4">تقديم طلب</h3>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="اكتب رسالة قصيرة (اختياري)..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm min-h-[120px] resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient flex-1 py-3 text-sm font-bold disabled:opacity-50"
              >
                {applyMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="bg-surface border border-outline text-on-surface-variant rounded-lg px-6 py-3 text-sm font-bold hover:border-primary transition-colors"
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
