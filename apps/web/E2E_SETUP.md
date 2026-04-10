# دليل إعداد اختبارات E2E مع Playwright

## التثبيت

### 1. تثبيت Playwright
```bash
cd apps/web
npm install -D @playwright/test
npx playwright install
```

### 2. تثبيت المتصفحات
```bash
npx playwright install chromium firefox webkit
```

---

## تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm run test:e2e
```

### تشغيل في وضع UI (مرئي)
```bash
npm run test:e2e:ui
```

### تشغيل اختبار معين
```bash
npx playwright test e2e/auth.spec.ts
```

### تشغيل على متصفح معين
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"
```

### مشاهدة التقرير
```bash
npx playwright show-report
```

---

## بنية الملفات

```
apps/web/
├── e2e/
│   ├── auth.spec.ts          # اختبارات المصادقة
│   ├── listings.spec.ts      # اختبارات الإعلانات
│   └── chat.spec.ts          # اختبارات الدردشة المباشرة
├── playwright.config.ts      # إعدادات Playwright
└── package.json              # Scripts
```

---

## الاختبارات المتاحة

### 1. اختبارات المصادقة (`auth.spec.ts`)
- ✅ تسجيل مستخدم جديد
- ✅ تسجيل الدخول بحساب موجود
- ✅ عرض رسالة خطأ لبيانات خاطئة
- ✅ تسجيل الخروج

### 2. اختبارات الإعلانات (`listings.spec.ts`)
- ✅ عرض شبكة الإعلانات
- ✅ فلترة بالسعر
- ✅ البحث عن إعلانات
- ✅ التنقل لصفحة التفاصيل
- ✅ إضافة للمفضلة (يحتاج تسجيل دخول)

### 3. اختبارات الدردشة (`chat.spec.ts`)
- ✅ إرسال واستقبال الرسائل فورياً (Real-Time)
- ✅ عرض مؤشر "يكتب..." (Typing Indicator)

---

## Scripts في package.json

أضف هذه الـ scripts في `apps/web/package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## ملاحظات هامة

### قبل تشغيل الاختبارات:
1. **تأكد من تشغيل الخوادم**:
   ```bash
   # Terminal 1: API
   cd apps/api
   node dist/main.js
   
   # Terminal 2: Web
   cd apps/web
   npm run dev
   ```

2. **تأكد من وجود بيانات تجريبية**:
   ```bash
   cd apps/api
   npx tsx prisma/seed.ts
   ```

3. **تأكد من المستخدمين**:
   - `seller@carone.om` / `Test1234`
   - `ahmed@carone.om` / `Test1234`

### في CI/CD:
- الاختبارات ستشغل الخوادم تلقائياً (webServer في playwright.config.ts)
- Retries: 2 مرات في CI
- Screenshot عند الفشل فقط
- Trace عند إعادة المحاولة

---

## استكشاف الأخطاء

### الاختبار يفشل باستمرار
```bash
# شغل في وضع Debug
npx playwright test --debug e2e/auth.spec.ts
```

### المتصفح لا يفتح
```bash
# تأكد من تثبيت المتصفحات
npx playwright install
```

### timeout errors
- زد الـ timeout في `playwright.config.ts`:
  ```ts
  use: {
    actionTimeout: 10000,
    navigationTimeout: 30000,
  }
  ```

### فحص السيلكتورز
```bash
# افتح Playwright Inspector
npx playwright codegen http://localhost:3000
```

---

## أمثلة على الاستخدام

### اختبار صفحة معينة بسرعة
```bash
npx playwright test -g "should login" --headed
```

### تسجيل فيديو للاختبار
في `playwright.config.ts`:
```ts
use: {
  video: 'on', // أو 'retain-on-failure'
}
```

### اختبار على أجهزة مختلفة
```bash
npx playwright test --project="Mobile Safari"
npx playwright test --project="Mobile Chrome"
```

---

## التوسع المستقبلي

### اختبارات إضافية مقترحة:
1. **اختبارات النماذج**:
   - إضافة إعلان جديد
   - تعديل إعلان موجود
   - تحديث الملف الشخصي

2. **اختبارات الأداء**:
   - قياس سرعة تحميل الصفحات
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

3. **اختبارات Accessibility**:
   - فحص التباين (Contrast)
   - دعم قارئ الشاشة
   - التنقل بالكيبورد

4. **اختبارات Visual Regression**:
   ```ts
   await expect(page).toHaveScreenshot('homepage.png');
   ```

### CI/CD Integration
مثال `.github/workflows/e2e.yml`:
```yaml
name: E2E Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## الخلاصة

Playwright مهيأ الآن لاختبار:
- ✅ المصادقة
- ✅ الإعلانات والفلاتر
- ✅ الدردشة المباشرة (Real-Time)

**للبدء**: `npm install -D @playwright/test && npx playwright install`
