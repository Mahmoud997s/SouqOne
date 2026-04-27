# Architecture Audit Report
**Date:** 2026-04-27T01:43:35.880Z

## 📊 إحصائيات المشروع
- إجمالي الملفات: 277
- إجمالي الصفحات: 53
- إجمالي الـ Components: 62
- إجمالي الـ Features: 7

## ✅ صفحات سليمة
| المسار | النوع | السطور |
|---|---|---|
| app/[locale]/add-listing/bus/page.tsx | ✅ صفحة حقيقية | 570 |
| app/[locale]/add-listing/car/page.tsx | ✅ صفحة حقيقية | 92 |
| app/[locale]/add-listing/equipment/page.tsx | ✅ صفحة حقيقية | 289 |
| app/[locale]/add-listing/operator/page.tsx | ✅ صفحة حقيقية | 206 |
| app/[locale]/add-listing/page.tsx | ✅ صفحة حقيقية | 160 |
| app/[locale]/add-listing/parts/page.tsx | ✅ صفحة حقيقية | 321 |
| app/[locale]/add-listing/service/page.tsx | ✅ صفحة حقيقية | 340 |
| app/[locale]/admin/jobs/page.tsx | ✅ صفحة حقيقية | 226 |
| app/[locale]/bookings/page.tsx | ✅ صفحة حقيقية | 641 |
| app/[locale]/bookings/[id]/page.tsx | ✅ صفحة حقيقية | 411 |
| app/[locale]/browse/[category]/page.tsx | ✅ صفحة حقيقية | 35 |
| app/[locale]/coming-soon/page.tsx | ✅ صفحة حقيقية | 69 |
| app/[locale]/edit-listing/bus/[id]/page.tsx | ✅ صفحة حقيقية | 50 |
| app/[locale]/edit-listing/car/[id]/page.tsx | ✅ صفحة حقيقية | 174 |
| app/[locale]/edit-listing/equipment/[id]/page.tsx | ✅ صفحة حقيقية | 59 |
| app/[locale]/edit-listing/job/[id]/page.tsx | ✅ صفحة حقيقية | 364 |
| app/[locale]/edit-listing/operator/[id]/page.tsx | ✅ صفحة حقيقية | 43 |
| app/[locale]/edit-listing/parts/[id]/page.tsx | ✅ صفحة حقيقية | 57 |
| app/[locale]/edit-listing/service/[id]/page.tsx | ✅ صفحة حقيقية | 50 |
| app/[locale]/equipment/operators/[id]/page.tsx | ✅ صفحة حقيقية | 180 |
| app/[locale]/equipment/page.tsx | ✅ صفحة حقيقية | 359 |
| app/[locale]/equipment/requests/new/page.tsx | ✅ صفحة حقيقية | 220 |
| app/[locale]/equipment/requests/[id]/page.tsx | ✅ صفحة حقيقية | 267 |
| app/[locale]/favorites/page.tsx | ✅ صفحة حقيقية | 395 |
| app/[locale]/forgot-password/page.tsx | ✅ صفحة حقيقية | 18 |
| app/[locale]/jobs/drivers/page.tsx | ✅ صفحة حقيقية | 163 |
| app/[locale]/jobs/drivers/[id]/page.tsx | ✅ صفحة حقيقية | 353 |
| app/[locale]/jobs/invites/page.tsx | ✅ صفحة حقيقية | 141 |
| app/[locale]/jobs/my/page.tsx | ✅ صفحة حقيقية | 287 |
| app/[locale]/jobs/new/page.tsx | ✅ صفحة حقيقية | 471 |
| app/[locale]/jobs/onboarding/page.tsx | ✅ صفحة حقيقية | 417 |
| app/[locale]/jobs/page.tsx | ✅ صفحة حقيقية | 467 |
| app/[locale]/jobs/verification/page.tsx | ✅ صفحة حقيقية | 237 |
| app/[locale]/jobs/[id]/page.tsx | ✅ صفحة حقيقية | 407 |
| app/[locale]/login/page.tsx | ✅ صفحة حقيقية | 18 |
| app/[locale]/messages/page.tsx | ✅ صفحة حقيقية | 32 |
| app/[locale]/messages/[id]/page.tsx | ✅ صفحة حقيقية | 168 |
| app/[locale]/my-listings/page.tsx | ✅ صفحة حقيقية | 464 |
| app/[locale]/notifications/page.tsx | ✅ صفحة حقيقية | 329 |
| app/[locale]/page.tsx | ✅ صفحة حقيقية | 79 |
| app/[locale]/payment/cancel/page.tsx | ✅ صفحة حقيقية | 33 |
| app/[locale]/payment/success/page.tsx | ✅ صفحة حقيقية | 65 |
| app/[locale]/pricing/page.tsx | ✅ صفحة حقيقية | 123 |
| app/[locale]/profile/page.tsx | ✅ صفحة حقيقية | 724 |
| app/[locale]/register/page.tsx | ✅ صفحة حقيقية | 18 |
| app/[locale]/reset-password/page.tsx | ✅ صفحة حقيقية | 18 |
| app/[locale]/sale/[type]/[id]/page.tsx | ✅ صفحة حقيقية | 155 |
| app/[locale]/search/page.tsx | ✅ صفحة حقيقية | 840 |
| app/[locale]/seller/[id]/page.tsx | ✅ صفحة حقيقية | 441 |
| app/[locale]/verify-email/page.tsx | ✅ صفحة حقيقية | 18 |

## ⚠️ صفحات تحتاج مراجعة (فارغة، Redirect، تجريبية)
| المسار | المشكلة | السطور |
|---|---|---|
| app/[locale]/dev/ui-inventory/page.tsx | 🔴 dev/test | 298 |
| app/[locale]/rental/[type]/[id]/page.tsx | ⚠️ redirect | 87 |
| app/[locale]/signup/page.tsx | ⚠️ redirect | 6 |

## 🔴 ملفات يجب حذفها (Demo/Test/Old)
| الملف | السبب |
|---|---|
| app/[locale]/dev/ui-inventory/page.tsx | Contains demo/test/backup keyword |
| features/ads/index.ts | ملف فارغ أو صغير جداً (4 سطر) |
| features/jobs/index.ts | ملف فارغ أو صغير جداً (2 سطر) |
| lib/config.ts | ملف فارغ أو صغير جداً (2 سطر) |

## 📦 Features الموجودة
| Feature | عدد الملفات | مستخدم في (أمثلة) | الحالة |
|---|---|---|---|
| ads | 4 | app/[locale]/add-listing/bus/page.tsx, app/[locale]/add-listing/car/page.tsx | ✅ |
| chat | 12 | app/[locale]/messages/layout.tsx, app/[locale]/messages/[id]/page.tsx | ✅ |
| home | 13 | app/[locale]/page.tsx | ✅ |
| jobs | 2 | app/[locale]/jobs/page.tsx, features/home/components/jobs-section.tsx | ✅ |
| listings | 29 | app/[locale]/browse/[category]/page.tsx, features/listings/types/unified-item.types.ts | ✅ |
| rental | 15 | app/[locale]/rental/[type]/[id]/page.tsx | ✅ |
| sale | 16 | app/[locale]/sale/[type]/[id]/page.tsx, features/rental/types/config.types.ts | ✅ |

## 🪝 API Hooks (src/lib/api/)
| Hook file | الـ exports الرئيسية | الاستخدام | الحالة |
|---|---|---|---|
| lib/api/admin-jobs.ts | useAdminJobs, useAdminJobStats, useAdminUpdateJob, useAdminDeleteJob, useAdminDrivers, useAdminEmployers | app/[locale]/admin/jobs/page.tsx | ✅ |
| lib/api/bookings.ts | useCreateBooking, useMyBookings, useReceivedBookings, useBooking, useUpdateBookingStatus, useBookingAvailability, useCalculatePrice | app/[locale]/bookings/page.tsx, app/[locale]/bookings/[id]/page.tsx | ✅ |
| lib/api/buses.ts | useBusListings, useBusListing, useMyBusListings, useBusListingBySlug, useAddBusImages, useRemoveBusImage, useCreateBusListing, useUpdateBusListing, useDeleteBusListing | app/[locale]/add-listing/bus/page.tsx, app/[locale]/edit-listing/bus/[id]/page.tsx | ✅ |
| lib/api/cars.ts | useBrands, useSearchBrands, useCarModels, useCarYears | app/[locale]/add-listing/parts/page.tsx, features/ads/components/listing-form.tsx | ✅ |
| lib/api/chat.ts | useConversations, useMessages, useCreateConversation, useSendMessage, useMarkRead, useDeleteMessage, useArchiveConversation, useToggleReaction, useSearchMessages | app/[locale]/equipment/operators/[id]/page.tsx, app/[locale]/equipment/requests/[id]/page.tsx | ✅ |
| lib/api/equipment.ts | useEquipmentListings, useEquipmentListing, useMyEquipmentListings, useEquipmentListingBySlug, useAddEquipmentImages, useRemoveEquipmentImage, useCreateEquipmentListing, useUpdateEquipmentListing, useDeleteEquipmentListing, useEquipmentRequests, useEquipmentRequest, useMyEquipmentRequests, useCreateEquipmentRequest, useUpdateEquipmentRequest, useChangeRequestStatus, useDeleteEquipmentRequest, useCreateBid, useAcceptBid, useRejectBid, useOperatorListings, useOperatorListing, useMyOperatorListings, useCreateOperatorListing, useUpdateOperatorListing, useDeleteOperatorListing | app/[locale]/add-listing/equipment/page.tsx, app/[locale]/add-listing/operator/page.tsx | ✅ |
| lib/api/favorites.ts | useFavorites, useFavoriteIds, useCheckFavorite, useToggleFavorite | app/[locale]/favorites/page.tsx, app/[locale]/profile/page.tsx | ✅ |
| lib/api/index.ts | لا يوجد hooks واضحة | مفيش | 🔴 |
| lib/api/jobs.ts | useRecommendedJobs, useJobs, useJob, useCreateJob, useUpdateJob, useDeleteJob, useMyJobs, useWithdrawApplication, useApplyToJob, useJobApplications, useUpdateApplicationStatus, useMyDriverProfile, useCreateDriverProfile, useUpdateDriverProfile, useDrivers, useDriver, useMyEmployerProfile, useCreateEmployerProfile, useUpdateEmployerProfile, useEmployer, useMyInvites, useInviteDriver, useRespondToInvite, useMyVerificationStatus, useSubmitVerification, useAdminVerifications, useDriverReviews, useAdminReviewVerification, usePayForApplication, useReleaseEscrow, useDisputeEscrow | app/[locale]/admin/jobs/page.tsx, app/[locale]/edit-listing/job/[id]/page.tsx | ✅ |
| lib/api/listings.ts | useListings, useMyListings, useListing, useListingBySlug, useCreateListing, useUpdateListing, useDeleteListing, useSuggestions | app/[locale]/add-listing/car/page.tsx, app/[locale]/edit-listing/car/[id]/page.tsx | ✅ |
| lib/api/notifications.ts | useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead | app/[locale]/notifications/page.tsx, components/layout/navbar.tsx | ✅ |
| lib/api/parts.ts | useParts, usePart, useMyParts, useCreatePart, useUpdatePart, useRemovePartImage, useDeletePart | app/[locale]/add-listing/parts/page.tsx, app/[locale]/edit-listing/parts/[id]/page.tsx | ✅ |
| lib/api/payments.ts | usePlans, useMySubscription, useMyPayments, useCreateFeaturedPayment, useCreateSubscriptionPayment, useVerifyPayment, useCancelSubscription | app/[locale]/my-listings/page.tsx, app/[locale]/payment/success/page.tsx | ✅ |
| lib/api/reviews.ts | useReviews, useReviewSummary, useCreateReview, useReplyReview | app/[locale]/seller/[id]/page.tsx, components/reviews/review-form.tsx | ✅ |
| lib/api/search.ts | useSearch, useAutocomplete | app/[locale]/add-listing/bus/page.tsx, app/[locale]/add-listing/car/page.tsx | ✅ |
| lib/api/services.ts | useCarServices, useCarService, useMyCarServices, useCarServiceBySlug, useToggleCarServiceStatus, useCreateCarService, useUpdateCarService, useRemoveServiceImage, useDeleteCarService | app/[locale]/add-listing/service/page.tsx, app/[locale]/edit-listing/service/[id]/page.tsx | ✅ |
| lib/api/transport.ts | useTransportServices, useTransportService, useMyTransportServices, useCreateTransportService, useUpdateTransportService, useDeleteTransportService | app/[locale]/my-listings/page.tsx, app/[locale]/search/page.tsx | ✅ |
| lib/api/trips.ts | useTrips, useTrip, useMyTrips, useCreateTrip, useUpdateTrip, useDeleteTrip | app/[locale]/my-listings/page.tsx, app/[locale]/search/page.tsx | ✅ |
| lib/api/uploads.ts | useUploadImage, useAddListingImage, useRemoveListingImage, useReorderListingImages | app/[locale]/edit-listing/car/[id]/page.tsx, app/[locale]/jobs/verification/page.tsx | ✅ |
| lib/api/users.ts | useMe, usePublicProfile, useUpdateProfile, useChangePassword | app/[locale]/bookings/page.tsx, app/[locale]/dev/ui-inventory/page.tsx | ✅ |

## 🔗 Imports مكسورة
لا توجد Broken Imports!

## 📋 Untracked/Modified Files (Git Status)
```
?? audit.js
?? audit_files.txt
?? pages_audit.json

```

## ✅ TypeScript Status
عدد الأخطاء الإجمالي (Type errors): 0
