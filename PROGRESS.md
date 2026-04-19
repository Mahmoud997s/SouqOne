# SouqOne — Progress Log

## ✅ مكتمل

### فلاتر صفحة السيارات `/listings`
- ماركة (dropdown — 22 ماركة)
- موديل (text input)
- سنة الصنع (من / إلى)
- نطاق السعر (أدنى / أقصى)
- أقصى عداد
- الحالة (chips)
- ناقل الحركة (أوتوماتيك / مانيوال)
- نوع الوقود (chips)
- المحافظة (dropdown عُمان)
- Badge عدد الفلاتر المفعّلة + زر "مسح الكل"
- Hero quick-filter chips تطبيق فوري (condition, fuel, transmission, make)

### صفحة البحث المركزية `/search`
- Hero search bar + recent searches
- Tabs: الكل / سيارات / قطع / باصات / معدات / خدمات / وظائف
- عداد نتائج لكل tab
- Desktop sidebar فلاتر: ترتيب / محافظة / سعر / ماركة / حالة / وقود
- Mobile bottom sheet نفس الفلاتر + badge مفعّلة
- SearchCard بـ badge ملوّن لكل entity type
- حالات: welcome / loading skeleton / no results / pagination
- Navbar "الكل" → `/search?q=` ✓

## 🔄 قيد العمل
_لا شيء حالياً_

## 📌 قادم
- تفعيل فلتر الوقود في `/search` (يحتاج إضافة `fuelType` لـ `SearchParams`)
- تحسينات UX إضافية حسب طلب المستخدم
