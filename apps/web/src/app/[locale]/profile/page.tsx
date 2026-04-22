'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { ErrorState } from '@/components/error-state';
import { useMe, useListings, useFavorites, useUpdateProfile, useChangePassword, useDeleteListing, useUploadImage } from '@/lib/api';
import { getGovernorates } from '@/lib/location-data';
import { inputCls, labelCls } from '@/lib/constants/form-styles';
import { getImageUrl } from '@/lib/image-utils';
import { VerifiedBadge } from '@/components/verified-badge';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from '@/i18n/navigation';

type Tab = 'listings' | 'favorites';
type Section = 'personal' | 'contact' | 'security' | null;

export default function ProfilePage() {
  const { data: user, isLoading: userLoading, isError: userError, refetch: refetchUser } = useMe();
  const { data: myListings, isLoading: listingsLoading } = useListings(user ? { sellerId: user.id, limit: '50' } : {});
  const { data: favorites, isLoading: favsLoading } = useFavorites();
  const { logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('listings');
  const [openSection, setOpenSection] = useState<Section>(null);
  const [editSection, setEditSection] = useState<Section>(null);

  /* ── Personal info edit state ── */
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  /* ── Contact edit state ── */
  const [phone, setPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  /* ── Password state ── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  /* ── Delete account confirm ── */
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteListing = useDeleteListing();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const tp = useTranslations('pages');
  const locale = useLocale();
  const govOptions = getGovernorates('OM', locale);

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

  function openEdit(section: Section) {
    if (!user) return;
    setOpenSection(section);
    setEditSection(section);
    if (section === 'personal') {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setGovernorate(user.governorate || '');
      setProfileMsg('');
    }
    if (section === 'contact') {
      setPhone(user.phone || '');
      setContactMsg('');
    }
    if (section === 'security') {
      setCurrentPassword('');
      setNewPassword('');
      setPwMsg('');
    }
  }

  function cancelEdit() {
    setEditSection(null);
    setProfileMsg('');
    setContactMsg('');
    setPwMsg('');
  }

  async function savePersonal(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg('');
    try {
      await updateProfile.mutateAsync({
        displayName: displayName || undefined,
        bio: bio || undefined,
        governorate: governorate || undefined,
      });
      setEditSection(null);
      setProfileMsg('تم حفظ المعلومات بنجاح');
      refetchUser();
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : tp('profileError'));
    }
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    setContactMsg('');
    try {
      await updateProfile.mutateAsync({ phone: phone || undefined });
      setEditSection(null);
      setContactMsg('تم حفظ بيانات التواصل');
      refetchUser();
    } catch (err) {
      setContactMsg(err instanceof Error ? err.message : tp('profileError'));
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPwMsg(tp('profilePasswordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setEditSection(null);
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : tp('profileError'));
    }
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  function toggleSection(s: Section) {
    setOpenSection(prev => prev === s ? null : s);
    if (editSection === s) cancelEdit();
  }

  /* ── Loading skeleton ── */
  if (userLoading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="min-h-screen bg-background flex flex-col">
          <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-20 pb-10">
            <div className="animate-pulse space-y-4">
              <div className="w-[88px] h-[88px] rounded-full bg-surface-container-high mx-auto" />
              <div className="h-5 bg-surface-container-high rounded-full w-36 mx-auto" />
              <div className="h-3 bg-surface-container-high rounded-full w-24 mx-auto" />
            </div>
          </div>
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
  const memberYear = new Date(user.createdAt).getFullYear();
  const initial = (user.displayName || user.username)[0]?.toUpperCase();

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background pb-16">

        {/* ══ COVER BANNER ══ */}
        <div className="relative h-36 bg-gradient-to-bl from-[#004ac6] via-[#1d4ed8] to-[#0B2447] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0zm30 30h30v30H30z\' fill=\'%23fff\' fill-opacity=\'.5\'/%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* ══ A) PROFILE HERO ══ */}
        <div className="relative max-w-lg mx-auto px-4 -mt-12">

          {/* Avatar — floats above card, z-10 so it layers over cover + card top edge */}
          <div className="flex justify-center relative z-10 mb-0">
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative w-[96px] h-[96px] rounded-full border-4 border-background shadow-xl overflow-hidden block group flex-shrink-0"
            >
              {user.avatarUrl ? (
                <Image src={getImageUrl(user.avatarUrl) || ''} alt={user.displayName || user.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary via-[#2563eb] to-[#0B2447] flex items-center justify-center text-white font-bold text-4xl select-none">
                  {initial}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {avatarUploading
                  ? <span className="material-symbols-outlined text-white text-xl animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                }
              </div>
            </button>
          </div>

          {/* Hero Card — sits below avatar, uses negative margin to tuck under avatar */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-[0_4px_32px_rgba(0,0,0,0.10)] overflow-hidden -mt-12">

            {/* Info area — pt-14 to clear the avatar overlap */}
            <div className="px-5 pt-14 pb-4 flex flex-col items-center text-center">

              {/* Name + verified */}
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="text-[20px] font-semibold text-on-surface tracking-tight">{user.displayName || user.username}</h1>
                {user.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-[12px] text-on-surface-variant mt-0.5">@{user.username} · عضو منذ {memberYear}</p>

              {user.governorate && (
                <p className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {user.governorate}
                </p>
              )}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 border-t border-outline-variant/15">
              <button onClick={() => setTab('listings')}
                className="py-3.5 text-center hover:bg-surface-container-low/60 transition-colors group">
                <p className="text-[18px] font-semibold text-on-surface group-hover:text-primary transition-colors">{activeCount}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide">{tp('profileStatsListings')}</p>
              </button>
              <button onClick={() => setTab('favorites')}
                className="py-3.5 text-center border-x border-outline-variant/15 hover:bg-surface-container-low/60 transition-colors group">
                <p className="text-[18px] font-semibold text-on-surface group-hover:text-primary transition-colors">{favsCount}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide">{tp('profileStatsFavorites')}</p>
              </button>
              <div className="py-3.5 text-center">
                <p className="text-[18px] font-semibold text-on-surface">
                  {user.isVerified
                    ? <span className="text-[15px] text-green-600 font-semibold">موثّق ✓</span>
                    : <span className="text-on-surface-variant">—</span>
                  }
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide">الحالة</p>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 py-4 border-t border-outline-variant/15">
              <Link href="/add-listing"
                className="w-full h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-base">add</span>
                {tp('profileAddListing')}
              </Link>
            </div>
          </div>
        </div>

        {/* ══ B) VERIFICATION BADGES ══ */}
        <div className="flex gap-2 justify-center flex-wrap px-4 mt-4 mb-6 max-w-lg mx-auto">
          {user.phone ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-medium dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              رقم الجوال مُفعَّل
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/30 text-[11px] font-medium cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => openEdit('contact')}>
              <span className="material-symbols-outlined text-xs">radio_button_unchecked</span>
              أضف رقم الجوال
            </span>
          )}
          {user.isVerified ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-medium dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              حساب موثّق
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/30 text-[11px] font-medium">
              <span className="material-symbols-outlined text-xs">radio_button_unchecked</span>
              تحقق من البريد الإلكتروني
            </span>
          )}
          {user.governorate && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-medium dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {user.governorate}
            </span>
          )}
        </div>

        {/* ══ CONTENT TABS ══ */}
        <div className="max-w-lg mx-auto px-4 mb-4">
          <div className="flex gap-1 border-b border-outline-variant/20 bg-surface-container-lowest rounded-t-xl overflow-hidden">
            {([
              { key: 'listings' as Tab, label: tp('profileTabListings'), count: activeCount },
              { key: 'favorites' as Tab, label: tp('profileTabFavorites'), count: favsCount },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                  tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Listings Tab ── */}
        {tab === 'listings' && (
          <div className="max-w-lg mx-auto px-4 mb-6">
            {listingsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-2xl animate-pulse" />)}
              </div>
            ) : myListings && myListings.items.length > 0 ? (
              <div className="space-y-3">
                <Link href="/add-listing"
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <span className="material-symbols-outlined text-primary text-lg">add</span>
                  </div>
                  <span className="text-[13px] font-medium">{tp('profileAddNewListing')}</span>
                </Link>
                {myListings.items.map((item) => {
                  const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30 transition-all">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                        {img?.url
                          ? <Image src={getImageUrl(img.url) || ''} alt={item.title} width={56} height={56} className="object-cover w-full h-full" />
                          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant/40 text-2xl">image</span></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-on-surface truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-on-surface-variant">
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {item.status === 'ACTIVE' ? tp('profileStatusActive') : item.status}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            {item.viewCount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/edit-listing/${item.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-all">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </Link>
                        <button onClick={() => { if (confirm(tp('profileDeleteConfirm'))) deleteListing.mutate(item.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/8 transition-all">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">inventory_2</span>
                </div>
                <p className="text-[14px] font-medium text-on-surface mb-1">{tp('profileNoListings')}</p>
                <p className="text-[12px] text-on-surface-variant mb-5">{tp('profileNoListingsDesc')}</p>
                <Link href="/add-listing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-base">add</span>
                  {tp('profileAddFirst')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Favorites Tab ── */}
        {tab === 'favorites' && (
          <div className="max-w-lg mx-auto px-4 mb-6">
            {favsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-2xl animate-pulse" />)}
              </div>
            ) : favorites && favorites.items?.length > 0 ? (
              <div className="space-y-3">
                {favorites.items.map((fav: any) => {
                  const item = fav.listing;
                  if (!item) return null;
                  const img = item.images?.find((i: any) => i.isPrimary) ?? item.images?.[0];
                  return (
                    <Link key={fav.id} href={`/sale/car/${item.id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30 transition-all">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                        {img?.url
                          ? <Image src={getImageUrl(img.url) || ''} alt={item.title} width={56} height={56} className="object-cover w-full h-full" />
                          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant/40 text-2xl">image</span></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-on-surface truncate">{item.title}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {item.price ? `${Number(item.price).toLocaleString()} ${item.currency}` : item.dailyPrice ? `${Number(item.dailyPrice).toLocaleString()} ${item.currency}/يوم` : ''}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-base flex-shrink-0">chevron_left</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-error">favorite</span>
                </div>
                <p className="text-[14px] font-medium text-on-surface mb-1">{tp('profileNoFavorites')}</p>
                <p className="text-[12px] text-on-surface-variant mb-5">{tp('profileNoFavoritesDesc')}</p>
                <Link href="/listings" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-base">search</span>
                  {tp('profileBrowseListings')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ══ C) PROFILE SECTIONS (accordion) ══ */}
        <div className="max-w-lg mx-auto space-y-0">

          {/* ─ 1. المعلومات الشخصية ─ */}
          <div className={`mx-4 mb-3 rounded-2xl border overflow-hidden bg-surface-container-lowest transition-all duration-200 ${
            openSection === 'personal'
              ? 'border-primary/30 shadow-[0_2px_16px_rgba(0,74,198,0.08)]'
              : 'border-outline-variant/20'
          }`}>
            <button
              onClick={() => toggleSection('personal')}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base">person</span>
                </div>
                <span className="text-[14px] font-medium text-on-surface">{tp('profilePersonalInfo')}</span>
              </div>
              <div className="flex items-center gap-2">
                {openSection === 'personal' && editSection !== 'personal' && (
                  <button onClick={(e) => { e.stopPropagation(); openEdit('personal'); }}
                    className="text-[12px] text-primary font-medium hover:underline">تعديل</button>
                )}
                <span className={`material-symbols-outlined transition-transform duration-200 ${openSection === 'personal' ? 'text-primary rotate-180' : 'text-on-surface-variant'}`}>
                  expand_more
                </span>
              </div>
            </button>

            {openSection === 'personal' && (
              <div className="border-t border-primary/10 p-4 bg-gradient-to-b from-primary/[0.02] to-transparent">
                {editSection === 'personal' ? (
                  <form onSubmit={savePersonal} className="space-y-4">
                    <div>
                      <label className={labelCls}>{tp('profileDisplayNameLabel')}</label>
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        placeholder={tp('profileDisplayNamePlaceholder')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('profileGovernorateLabel')}</label>
                      <select value={governorate} onChange={e => setGovernorate(e.target.value)} className={inputCls}>
                        <option value="">{tp('profileGovernoratePlaceholder')}</option>
                        {govOptions.map(g => <option key={g.value} value={g.label}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>{tp('profileBioLabel')}</label>
                      <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                        placeholder={tp('profileBioPlaceholder')} className={inputCls + ' resize-none'} />
                    </div>
                    {profileMsg && (
                      <p className={`text-[12px] font-medium ${profileMsg.includes('خطأ') || profileMsg.includes('Error') ? 'text-error' : 'text-brand-green'}`}>{profileMsg}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={updateProfile.isPending}
                        className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                        {updateProfile.isPending && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                        {tp('profileSaveChanges')}
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="px-4 h-10 rounded-xl border border-outline-variant/30 text-[13px] text-on-surface-variant hover:bg-surface-container transition-colors">
                        {tp('profileCancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: tp('profileInfoName'), value: user.displayName || '—' },
                      { label: 'اسم المستخدم', value: `@${user.username}` },
                      { label: tp('profileInfoGovernorate'), value: user.governorate || '—' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-1 border-b border-outline-variant/10 last:border-0">
                        <span className="text-[12px] text-on-surface-variant">{row.label}</span>
                        <span className="text-[13px] font-medium text-on-surface">{row.value}</span>
                      </div>
                    ))}
                    {user.bio && <p className="text-[12px] text-on-surface-variant pt-1 leading-relaxed">{user.bio}</p>}
                    {profileMsg && (
                      <p className="text-[12px] text-brand-green font-medium">{profileMsg}</p>
                    )}
                    <button onClick={() => openEdit('personal')}
                      className="text-[12px] text-primary font-medium hover:underline mt-1">تعديل المعلومات</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─ 2. بيانات التواصل ─ */}
          <div className={`mx-4 mb-3 rounded-2xl border overflow-hidden bg-surface-container-lowest transition-all duration-200 ${
            openSection === 'contact'
              ? 'border-primary/30 shadow-[0_2px_16px_rgba(0,74,198,0.08)]'
              : 'border-outline-variant/20'
          }`}>
            <button
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base">contact_phone</span>
                </div>
                <span className="text-[14px] font-medium text-on-surface">بيانات التواصل</span>
              </div>
              <div className="flex items-center gap-2">
                {openSection === 'contact' && editSection !== 'contact' && (
                  <button onClick={(e) => { e.stopPropagation(); openEdit('contact'); }}
                    className="text-[12px] text-primary font-medium hover:underline">تعديل</button>
                )}
                <span className={`material-symbols-outlined transition-transform duration-200 ${openSection === 'contact' ? 'text-primary rotate-180' : 'text-on-surface-variant'}`}>
                  expand_more
                </span>
              </div>
            </button>

            {openSection === 'contact' && (
              <div className="border-t border-primary/10 p-4 bg-gradient-to-b from-primary/[0.02] to-transparent">
                {editSection === 'contact' ? (
                  <form onSubmit={saveContact} className="space-y-4">
                    <div>
                      <label className={labelCls}>{tp('profilePhoneLabel')}</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+968 9XXX XXXX" className={inputCls} dir="ltr" />
                    </div>
                    {contactMsg && (
                      <p className={`text-[12px] font-medium ${contactMsg.includes('خطأ') || contactMsg.includes('Error') ? 'text-error' : 'text-brand-green'}`}>{contactMsg}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={updateProfile.isPending}
                        className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                        {updateProfile.isPending && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                        {tp('profileSaveChanges')}
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="px-4 h-10 rounded-xl border border-outline-variant/30 text-[13px] text-on-surface-variant hover:bg-surface-container transition-colors">
                        {tp('profileCancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: tp('profileInfoEmail'), value: user.email, verified: user.isVerified },
                      { label: tp('profileInfoPhone'), value: user.phone || '—', verified: !!user.phone },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-1 border-b border-outline-variant/10 last:border-0">
                        <span className="text-[12px] text-on-surface-variant">{row.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium text-on-surface">{row.value}</span>
                          {row.verified
                            ? <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            : <span className="material-symbols-outlined text-on-surface-variant/40 text-sm">radio_button_unchecked</span>
                          }
                        </div>
                      </div>
                    ))}
                    {contactMsg && <p className="text-[12px] text-brand-green font-medium">{contactMsg}</p>}
                    <button onClick={() => openEdit('contact')}
                      className="text-[12px] text-primary font-medium hover:underline mt-1">تعديل بيانات التواصل</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─ 3. الأمان ─ */}
          <div className={`mx-4 mb-3 rounded-2xl border overflow-hidden bg-surface-container-lowest transition-all duration-200 ${
            openSection === 'security'
              ? 'border-primary/30 shadow-[0_2px_16px_rgba(0,74,198,0.08)]'
              : 'border-outline-variant/20'
          }`}>
            <button
              onClick={() => toggleSection('security')}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base">lock</span>
                </div>
                <span className="text-[14px] font-medium text-on-surface">{tp('profileChangePassword')}</span>
              </div>
              <span className={`material-symbols-outlined transition-transform duration-200 ${openSection === 'security' ? 'text-primary rotate-180' : 'text-on-surface-variant'}`}>
                expand_more
              </span>
            </button>

            {openSection === 'security' && (
              <div className="border-t border-primary/10 p-4 bg-gradient-to-b from-primary/[0.02] to-transparent">
                {editSection === 'security' ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className={labelCls}>{tp('profileCurrentPassword')}</label>
                      <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('profileNewPassword')}</label>
                      <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputCls} />
                    </div>
                    {pwMsg && (
                      <p className={`text-[12px] font-medium ${pwMsg.includes('خطأ') || pwMsg.includes('Error') ? 'text-error' : 'text-brand-green'}`}>{pwMsg}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={changePassword.isPending}
                        className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                        {changePassword.isPending && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                        {tp('profileChangePasswordBtn')}
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="px-4 h-10 rounded-xl border border-outline-variant/30 text-[13px] text-on-surface-variant hover:bg-surface-container transition-colors">
                        {tp('profileCancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <button onClick={() => openEdit('security')}
                      className="w-full h-10 rounded-xl border border-outline-variant/25 text-[13px] text-on-surface font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">lock_reset</span>
                      {tp('profileChangePasswordBtn')}
                    </button>

                    <div className="pt-1 border-t border-outline-variant/10">
                      {!deleteConfirm ? (
                        <button onClick={() => setDeleteConfirm(true)}
                          className="w-full h-10 rounded-xl text-[13px] text-error font-medium hover:bg-error/5 transition-colors flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">person_remove</span>
                          حذف الحساب
                        </button>
                      ) : (
                        <div className="bg-error/5 rounded-xl p-3 space-y-2">
                          <p className="text-[12px] text-error font-medium text-center">هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.</p>
                          <div className="flex gap-2">
                            <button className="flex-1 h-9 rounded-xl bg-error text-white text-[12px] font-medium hover:bg-error/90 transition-colors">
                              نعم، احذف حسابي
                            </button>
                            <button onClick={() => setDeleteConfirm(false)}
                              className="flex-1 h-9 rounded-xl border border-outline-variant/30 text-[12px] text-on-surface-variant hover:bg-surface-container transition-colors">
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {pwMsg && <p className="text-[12px] text-brand-green font-medium">{pwMsg}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ E) LOGOUT ══ */}
        <div className="max-w-lg mx-auto px-4 mt-2 mb-10">
          <button onClick={handleLogout}
            className="w-full h-11 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-[13px] text-on-surface-variant hover:text-error hover:border-error/30 hover:bg-error/5 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">logout</span>
            تسجيل الخروج
          </button>
        </div>

      </div>
      <Footer />
    </AuthGuard>
  );
}
