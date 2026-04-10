'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { useBooking, useUpdateBookingStatus } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';
import { getImageUrl } from '@/lib/image-utils';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS_BORDER, CANCEL_LABELS } from '@/lib/constants/mappings';

const statusLabels = BOOKING_STATUS_LABELS;
const statusColors = BOOKING_STATUS_COLORS_BORDER;
const cancelLabels = CANCEL_LABELS;

export default function BookingDetailPage() {
  return (
    <AuthGuard>
      <BookingDetailContent />
    </AuthGuard>
  );
}

function BookingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: booking, isLoading, isError } = useBooking(id);
  const updateStatus = useUpdateBookingStatus();

  const isOwner = user && booking?.ownerId === user.id;
  const isRenter = user && booking?.renterId === user.id;

  async function handleStatus(status: string) {
    try {
      await updateStatus.mutateAsync({ id, status });
      addToast('success', 'تم تحديث حالة الحجز');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'حدث خطأ');
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-container-low rounded-xl w-1/3" />
            <div className="h-64 bg-surface-container-low rounded-xl" />
            <div className="h-48 bg-surface-container-low rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  if (isError || !booking) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">error</span>
          <p className="text-xl font-bold mb-2">الحجز غير موجود</p>
          <Link href="/bookings" className="text-primary font-bold">العودة للحجوزات</Link>
        </main>
      </>
    );
  }

  const img = booking.listing?.images?.find((i: any) => i.isPrimary) ?? booking.listing?.images?.[0];
  const otherUser = isOwner ? booking.renter : booking.owner;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/bookings" className="hover:text-primary transition-colors">الحجوزات</Link>
          <span className="material-symbols-outlined text-xs">chevron_left</span>
          <span className="text-on-surface font-medium">تفاصيل الحجز</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-5 border ${statusColors[booking.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">
                    {booking.status === 'PENDING' ? 'hourglass_top' :
                     booking.status === 'CONFIRMED' ? 'check_circle' :
                     booking.status === 'ACTIVE' ? 'play_circle' :
                     booking.status === 'COMPLETED' ? 'task_alt' : 'cancel'}
                  </span>
                  <div>
                    <p className="font-extrabold text-lg">{statusLabels[booking.status]}</p>
                    <p className="text-xs opacity-75">
                      {booking.status === 'PENDING' && 'في انتظار موافقة المؤجر'}
                      {booking.status === 'CONFIRMED' && 'تم تأكيد الحجز'}
                      {booking.status === 'ACTIVE' && 'السيارة مع المستأجر حالياً'}
                      {booking.status === 'COMPLETED' && 'تم إكمال الحجز بنجاح'}
                      {booking.status === 'CANCELLED' && 'تم إلغاء هذا الحجز'}
                      {booking.status === 'REJECTED' && 'تم رفض هذا الحجز'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-4">
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-surface-container-low shrink-0">
                {getImageUrl(img?.url) ? (
                  <img src={getImageUrl(img?.url)!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl">car_rental</span>
                  </div>
                )}
              </div>
              <div>
                <Link href={`/cars/${booking.listingId}`} className="font-bold text-on-surface hover:text-primary transition-colors">
                  {booking.listing?.title ?? 'سيارة'}
                </Link>
                <p className="text-xs text-on-surface-variant mt-1">
                  {booking.listing?.year} · {booking.listing?.make} {booking.listing?.model}
                </p>
                {booking.listing?.governorate && (
                  <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {booking.listing.governorate}
                  </p>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <h2 className="font-extrabold text-lg mb-4">تفاصيل الحجز</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">تاريخ البداية</p>
                  <p className="font-bold text-sm">{new Date(booking.startDate).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">تاريخ النهاية</p>
                  <p className="font-bold text-sm">{new Date(booking.endDate).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">المدة</p>
                  <p className="font-bold text-sm">{booking.totalDays} يوم</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">سياسة الإلغاء</p>
                  <p className="font-bold text-sm">{cancelLabels[booking.cancellationPolicy] ?? booking.cancellationPolicy}</p>
                </div>
                {booking.pickupLocation && (
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">موقع الاستلام</p>
                    <p className="font-bold text-sm">{booking.pickupLocation}</p>
                  </div>
                )}
                {booking.dropoffLocation && (
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">موقع التسليم</p>
                    <p className="font-bold text-sm">{booking.dropoffLocation}</p>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {booking.driverRequested && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">مع سائق</span>}
                {booking.insuranceSelected && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">تأمين شامل</span>}
              </div>

              {booking.notes && (
                <div className="mt-4 bg-surface-container-low rounded-xl p-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">ملاحظات</p>
                  <p className="text-sm text-on-surface">{booking.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <h2 className="font-extrabold text-lg mb-4">السجل الزمني</h2>
              <div className="space-y-3">
                <TimelineItem date={booking.createdAt} label="تم إنشاء الحجز" icon="add_circle" />
                {booking.confirmedAt && <TimelineItem date={booking.confirmedAt} label="تم تأكيد الحجز" icon="check_circle" />}
                {booking.cancelledAt && <TimelineItem date={booking.cancelledAt} label="تم إلغاء الحجز" icon="cancel" />}
                {booking.completedAt && <TimelineItem date={booking.completedAt} label="تم إكمال الحجز" icon="task_alt" />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">ملخص الدفع</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">المبلغ الإجمالي</span>
                  <span className="font-bold text-on-surface">{Number(booking.totalPrice).toLocaleString('en-US')} ر.ع.</span>
                </div>
                {booking.depositAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">مبلغ التأمين</span>
                    <span className="font-bold text-on-surface">{Number(booking.depositAmount).toLocaleString('en-US')} ر.ع.</span>
                  </div>
                )}
              </div>
              <div className="border-t border-surface-container pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-on-surface">الإجمالي</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {Number(booking.totalPrice).toLocaleString('en-US')} <small className="text-xs text-on-surface-variant">ر.ع.</small>
                  </span>
                </div>
              </div>
            </div>

            {/* Other User */}
            {otherUser && (
              <div className="bg-surface-container-lowest rounded-xl p-6">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                  {isOwner ? 'المستأجر' : 'المؤجر'}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                    {(otherUser.displayName || otherUser.username)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{otherUser.displayName || otherUser.username}</p>
                  </div>
                </div>
                {otherUser.phone && (
                  <a href={`tel:${otherUser.phone}`} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                    <span className="material-symbols-outlined text-lg">call</span>
                    {otherUser.phone}
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isOwner && booking.status === 'PENDING' && (
                <>
                  <button onClick={() => handleStatus('CONFIRMED')} disabled={updateStatus.isPending} className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient w-full py-3 text-sm font-bold disabled:opacity-60">
                    قبول الحجز
                  </button>
                  <button onClick={() => handleStatus('REJECTED')} disabled={updateStatus.isPending} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-60">
                    رفض الحجز
                  </button>
                </>
              )}
              {isOwner && booking.status === 'CONFIRMED' && (
                <button onClick={() => handleStatus('ACTIVE')} disabled={updateStatus.isPending} className="bg-primary text-on-primary hover:brightness-110 rounded-lg w-full py-3 text-sm font-bold disabled:opacity-60">
                  تفعيل الحجز (تم استلام السيارة)
                </button>
              )}
              {isOwner && booking.status === 'ACTIVE' && (
                <button onClick={() => handleStatus('COMPLETED')} disabled={updateStatus.isPending} className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient w-full py-3 text-sm font-bold disabled:opacity-60">
                  إكمال الحجز (تم إرجاع السيارة)
                </button>
              )}
              {isRenter && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                <button onClick={() => handleStatus('CANCELLED')} disabled={updateStatus.isPending} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-60">
                  إلغاء الحجز
                </button>
              )}

              <Link href="/bookings" className="block text-center text-primary font-bold text-sm hover:underline">
                العودة للحجوزات
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TimelineItem({ date, label, icon }: { date: string; label: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      <div>
        <p className="text-sm font-bold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant">
          {new Date(date).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
