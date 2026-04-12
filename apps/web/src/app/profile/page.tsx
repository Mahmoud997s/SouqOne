'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { ErrorState } from '@/components/error-state';
import { useMe, useListings, useFavorites, useUpdateProfile, useChangePassword, useDeleteListing, useUploadImage } from '@/lib/api';
import { getGovernorates } from '@/lib/location-data';
import { inputCls, labelCls } from '@/lib/constants/form-styles';
import { getImageUrl } from '@/lib/image-utils';
import { VerifiedBadge } from '@/components/verified-badge';

type Tab = 'listings' | 'favorites' | 'settings';

export default function ProfilePage() {
  const { data: user, isLoading: userLoading, isError: userError, refetch: refetchUser } = useMe();
  const { data: myListings, isLoading: listingsLoading } = useListings(user ? { sellerId: user.id, limit: '50' } : {});
  const { data: favorites, isLoading: favsLoading } = useFavorites();

  const [tab, setTab] = useState<Tab>('listings');
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [governorate, setGovernorate] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteListing = useDeleteListing();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await uploadImage.mutateAsync(file);
      await updateProfile.mutateAsync({ avatarUrl: result.url });
      refetchUser();
    } catch {
      // silently fail
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function startEdit() {
    if (!user) return;
    setDisplayName(user.displayName || '');
    setPhone(user.phone || '');
    setBio(user.bio || '');
    setGovernorate(user.governorate || '');
    setEditMode(true);
    setTab('settings');
    setProfileMsg('');
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg('');
    try {
      await updateProfile.mutateAsync({
        displayName: displayName || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        governorate: governorate || undefined,
      });
      setEditMode(false);
      setProfileMsg('تم الحفظ بنجاح');
      refetchUser();
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : 'خطأ');
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPwMsg('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : 'خطأ');
    }
  }

  /* ── Loading skeleton ── */
  if (userLoading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="h-48 md:h-56 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] animate-pulse" />
          <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20">
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 p-6 md:p-8 animate-pulse">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-surface-container-high shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-surface-container-high rounded-full w-48" />
                  <div className="h-4 bg-surface-container-high rounded-full w-32" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  /* ── Error state ── */
  if (userError || !user) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="pt-28 px-8"><ErrorState onRetry={() => refetchUser()} /></div>
      </AuthGuard>
    );
  }

  const activeCount = myListings?.items?.length ?? 0;
  const favsCount = favorites?.items?.length ?? 0;
  const totalViews = myListings?.items?.reduce((s, i) => s + (i.viewCount || 0), 0) ?? 0;
  const memberSince = new Date(user.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long' });
  const initial = (user.displayName || user.username)[0]?.toUpperCase();
  const govOptions = getGovernorates('OM');

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'listings', label: 'إعلاناتي', icon: 'directions_car', count: activeCount },
    { key: 'favorites', label: 'المفضلة', icon: 'favorite', count: favsCount },
    { key: 'settings', label: 'الإعدادات', icon: 'settings' },
  ];

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background" dir="rtl">

        {/* ══════════════════════════════════════
            Cover Gradient
           ══════════════════════════════════════ */}
        <div className="relative h-48 md:h-56 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        {/* ══════════════════════════════════════
            Profile Card (overlapping cover)
           ══════════════════════════════════════ */}
        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-24 md:-mt-28 relative z-10 pb-16">

          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden mb-6">

            {/* ── Top section: Avatar + Info + Actions ── */}
            <div className="p-4 sm:p-5 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                {/* Avatar with upload */}
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shrink-0 ring-4 ring-surface-container-lowest dark:ring-surface-container shadow-lg group overflow-hidden"
                >
                  {user.avatarUrl ? (
                    <img src={getImageUrl(user.avatarUrl) || ''} alt={user.displayName || user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-black text-2xl sm:text-3xl md:text-4xl">
                      {initial}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {avatarUploading ? (
                      <span className="material-symbols-outlined text-white text-lg animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                    )}
                  </div>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h1 className="text-base sm:text-xl md:text-2xl font-black text-on-surface truncate">{user.displayName || user.username}</h1>
                    {user.isVerified && <VerifiedBadge />}
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium mb-2">@{user.username}</p>
                  <div className="flex items-center gap-4 flex-wrap text-xs text-on-surface-variant">
                    {user.governorate && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {user.governorate}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                      عضو منذ {memberSince}
                    </span>
                  </div>
                  {user.bio && (
                    <p className="text-sm text-on-surface-variant mt-2.5 leading-relaxed line-clamp-2">{user.bio}</p>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-center">
                  <button onClick={startEdit} className="h-8 sm:h-10 px-3 sm:px-5 bg-primary text-on-primary text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 hover:brightness-110 transition-all rounded-lg">
                    <span className="material-symbols-outlined text-base sm:text-lg">edit</span>
                    <span className="hidden sm:inline">تعديل</span>
                  </button>
                  <Link href="/add-listing" className="h-8 sm:h-10 px-3 sm:px-5 btn-green text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 hover:brightness-105 transition-all rounded-lg">
                    <span className="material-symbols-outlined text-base sm:text-lg">add</span>
                    <span className="hidden sm:inline">أضف إعلان</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Stats Bar ── */}
            <div className="border-t border-outline-variant/10 dark:border-outline-variant/20 grid grid-cols-3 divide-x divide-outline-variant/10 dark:divide-outline-variant/20">
              <button onClick={() => setTab('listings')} className="py-3 sm:py-4 px-2 sm:px-3 text-center hover:bg-surface-container-low/50 dark:hover:bg-surface-container-high/30 transition-colors group">
                <p className="text-lg sm:text-xl md:text-2xl font-black text-on-surface group-hover:text-primary transition-colors">{activeCount}</p>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-on-surface-variant font-bold">إعلانات</p>
              </button>
              <button onClick={() => setTab('favorites')} className="py-3 sm:py-4 px-2 sm:px-3 text-center hover:bg-surface-container-low/50 dark:hover:bg-surface-container-high/30 transition-colors group">
                <p className="text-lg sm:text-xl md:text-2xl font-black text-on-surface group-hover:text-error transition-colors">{favsCount}</p>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-on-surface-variant font-bold">المفضلة</p>
              </button>
              <div className="py-3 sm:py-4 px-2 sm:px-3 text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-black text-on-surface">{totalViews}</p>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-on-surface-variant font-bold">مشاهدات</p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              Tabs
             ══════════════════════════════════════ */}
          <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                  tab === t.key
                    ? 'bg-surface-container-lowest dark:bg-surface-container text-primary shadow-sm border border-outline-variant/10 dark:border-outline-variant/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 dark:hover:bg-surface-container-high/30'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{t.icon}</span>
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    tab === t.key ? 'bg-primary/10 text-primary' : 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════
              Tab Content
             ══════════════════════════════════════ */}

          {/* ── Listings Tab ── */}
          {tab === 'listings' && (
            <>
              {listingsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-surface-container-high aspect-[4/3]" />
                  ))}
                </div>
              ) : myListings && myListings.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Add New */}
                  <Link
                    href="/add-listing"
                    className="bg-surface-container-lowest dark:bg-surface-container border-2 border-dashed border-outline-variant/25 dark:border-outline-variant/40 aspect-[4/3] flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl text-primary">add</span>
                    </div>
                    <span className="font-black text-sm group-hover:text-primary transition-colors">أضف إعلان جديد</span>
                  </Link>

                  {myListings.items.map((item) => {
                    const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
                    return (
                      <div key={item.id} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden group hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all">
                        {/* Status badge */}
                        <div className="relative">
                          <VehicleCard
                            id={item.id}
                            title={item.title}
                            make={item.make}
                            model={item.model}
                            year={item.year}
                            price={item.price}
                            currency={item.currency}
                            mileage={item.mileage}
                            fuelType={item.fuelType}
                            imageUrl={getImageUrl(img?.url)}
                            listingType={item.listingType}
                            dailyPrice={item.dailyPrice}
                          />
                          <div className="absolute top-2 left-2">
                            <span className={`text-[10px] font-black px-2 py-1 ${
                              item.status === 'ACTIVE'
                                ? 'bg-brand-green/90 text-white'
                                : 'bg-surface-container-high/90 text-on-surface-variant'
                            }`}>
                              {item.status === 'ACTIVE' ? 'نشط' : item.status}
                            </span>
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="px-3 py-2 flex items-center gap-3 text-[11px] text-on-surface-variant border-t border-outline-variant/10 dark:border-outline-variant/20">
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            {item.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {new Date(item.createdAt).toLocaleDateString('ar-OM')}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex border-t border-outline-variant/10 dark:border-outline-variant/20">
                          <Link href={`/edit-listing/${item.id}`} className="flex-1 py-2.5 text-center text-xs font-black text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            تعديل
                          </Link>
                          <div className="w-px bg-outline-variant/10 dark:bg-outline-variant/20" />
                          <button
                            onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) deleteListing.mutate(item.id); }}
                            className="flex-1 py-2.5 text-center text-xs font-black text-on-surface-variant hover:text-error hover:bg-error/5 transition-all flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 p-12 md:p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
                  </div>
                  <h3 className="text-lg font-black text-on-surface mb-2">لا توجد إعلانات بعد</h3>
                  <p className="text-sm text-on-surface-variant mb-6 max-w-xs mx-auto">أضف إعلانك الأول وابدأ الوصول لآلاف المهتمين</p>
                  <Link href="/add-listing" className="inline-flex items-center gap-2 btn-editorial px-8 py-3 text-sm font-black hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined text-lg">add</span>
                    أضف إعلانك الأول
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ── Favorites Tab ── */}
          {tab === 'favorites' && (
            <>
              {favsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-surface-container-high aspect-[4/3]" />
                  ))}
                </div>
              ) : favorites && favorites.items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.items.map((fav: any) => {
                    const item = fav.listing;
                    if (!item) return null;
                    const img = item.images?.find((i: any) => i.isPrimary) ?? item.images?.[0];
                    return (
                      <div key={fav.id} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all">
                        <VehicleCard
                          id={item.id}
                          title={item.title}
                          make={item.make}
                          model={item.model}
                          year={item.year}
                          price={item.price}
                          currency={item.currency}
                          mileage={item.mileage}
                          fuelType={item.fuelType}
                          imageUrl={getImageUrl(img?.url)}
                          listingType={item.listingType}
                          dailyPrice={item.dailyPrice}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 p-12 md:p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-error/10 dark:bg-error/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-error">favorite</span>
                  </div>
                  <h3 className="text-lg font-black text-on-surface mb-2">لا توجد مفضلات</h3>
                  <p className="text-sm text-on-surface-variant mb-6 max-w-xs mx-auto">احفظ السيارات التي تعجبك لتعود إليها لاحقاً</p>
                  <Link href="/listings" className="inline-flex items-center gap-2 btn-editorial px-8 py-3 text-sm font-black hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined text-lg">search</span>
                    تصفح الإعلانات
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ── Settings Tab ── */}
          {tab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Personal Info */}
              {editMode ? (
                <form onSubmit={saveProfile} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden lg:col-span-2">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      <h3 className="text-base font-black">تعديل الملف الشخصي</h3>
                    </div>
                    <button type="button" onClick={() => setEditMode(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>الاسم المعروض</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="الاسم المعروض" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>رقم الهاتف</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+968 9XXX XXXX" className={inputCls} dir="ltr" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>المحافظة</label>
                      <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} className={inputCls}>
                        <option value="">اختر المحافظة</option>
                        {govOptions.map((g) => <option key={g.value} value={g.label}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>نبذة عنك</label>
                      <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="أخبر المشترين عنك..." className={inputCls + ' resize-none'} />
                    </div>
                    {profileMsg && (
                      <div className={`flex items-center gap-2 p-3 text-sm font-bold ${profileMsg.includes('خطأ') ? 'bg-error/10 text-error' : 'bg-brand-green/10 text-brand-green'}`}>
                        <span className="material-symbols-outlined text-base">{profileMsg.includes('خطأ') ? 'error' : 'check_circle'}</span>
                        {profileMsg}
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={updateProfile.isPending} className="btn-editorial flex-1 py-3 text-sm font-black hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {updateProfile.isPending ? (
                          <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> جارٍ الحفظ...</>
                        ) : (
                          <><span className="material-symbols-outlined text-base">save</span> حفظ التغييرات</>
                        )}
                      </button>
                      <button type="button" onClick={() => setEditMode(false)} className="px-6 py-3 text-sm font-black text-on-surface-variant border border-outline-variant/15 dark:border-outline-variant/30 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-all">
                        إلغاء
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      <h3 className="text-base font-black">المعلومات الشخصية</h3>
                    </div>
                    <button onClick={startEdit} className="text-primary text-xs font-black hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      تعديل
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { icon: 'badge', label: 'الاسم', value: user.displayName || '—' },
                        { icon: 'alternate_email', label: 'اسم المستخدم', value: `@${user.username}` },
                        { icon: 'mail', label: 'البريد', value: user.email },
                        { icon: 'phone', label: 'الهاتف', value: user.phone || '—' },
                        { icon: 'location_on', label: 'المحافظة', value: user.governorate || '—' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-lg text-on-surface-variant/50 shrink-0">{row.icon}</span>
                          <span className="text-xs text-on-surface-variant w-20 shrink-0">{row.label}</span>
                          <span className="text-sm font-medium text-on-surface truncate">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    {profileMsg && !editMode && (
                      <div className="mt-4 flex items-center gap-2 p-3 text-sm font-bold bg-brand-green/10 text-brand-green">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        {profileMsg}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden self-start">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    <h3 className="text-base font-black">تغيير كلمة المرور</h3>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className={labelCls}>كلمة المرور الحالية</label>
                    <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>كلمة المرور الجديدة</label>
                    <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
                  </div>
                  {pwMsg && (
                    <div className={`flex items-center gap-2 p-3 text-sm font-bold ${pwMsg.includes('خطأ') ? 'bg-error/10 text-error' : 'bg-brand-green/10 text-brand-green'}`}>
                      <span className="material-symbols-outlined text-base">{pwMsg.includes('خطأ') ? 'error' : 'check_circle'}</span>
                      {pwMsg}
                    </div>
                  )}
                  <button type="submit" disabled={changePassword.isPending} className="btn-editorial w-full py-3 text-sm font-black hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {changePassword.isPending ? (
                      <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> جارٍ التغيير...</>
                    ) : (
                      <><span className="material-symbols-outlined text-base">lock_reset</span> تغيير كلمة المرور</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </AuthGuard>
  );
}
