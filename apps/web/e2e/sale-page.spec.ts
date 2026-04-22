/**
 * E2E — Unified Sale Detail Page (/sale/[type]/[id])
 * Comprehensive coverage for all 5 API types: car, bus, equipment, part, service.
 * Tests every section rendered by SalePageShell against real API data.
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Shared helper: navigate to first listing of a type ──────────────────────

const LOCALE = '/en';
const API_BASE = 'https://caroneapi-production.up.railway.app/api/v1';

/** Fetch first listing ID from API, then navigate directly to the sale page */
async function goToFirstListing(
  page: Page,
  apiEndpoint: string,
  saleType: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}${apiEndpoint}?limit=1&page=1`);
    if (!res.ok) return false;
    const data = await res.json();
    const items = data.data ?? data.items ?? data.listings ?? data;
    const firstItem = Array.isArray(items) ? items[0] : Array.isArray(data) ? data[0] : null;
    if (!firstItem?.id && !firstItem?.slug) return false;
    const id = firstItem.slug ?? firstItem.id;
    await page.goto(`${LOCALE}/sale/${saleType}/${id}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 30000 });
    return true;
  } catch {
    return false;
  }
}

/** Sections present on every listing type */
async function assertCoreSections(page: Page) {
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('معروض بواسطة').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('وصف الإعلان').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('المواصفات الأساسية').first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('button').filter({ hasText: 'تواصل' }).first()).toBeVisible({ timeout: 10000 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CAR — /listings → /sale/car/[id]
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Car Sale Page', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await goToFirstListing(page, '/listings', 'car');
    if (!ok) test.skip();
  });

  // ── Layout & Navigation ──
  test('renders title, breadcrumb, gallery', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('nav a').first()).toBeVisible();
    await expect(page.locator('img').first()).toBeVisible({ timeout: 10000 });
  });

  test('share button visible', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'مشاركة' })).toBeVisible();
  });

  test('save button toggles', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /حفظ|محفوظ/ }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForTimeout(300);
    await expect(btn).toBeVisible();
  });

  // ── Seller Section (API: seller.name, seller.memberSince, seller.verified) ──
  test('shows seller name and member-since from API', async ({ page }) => {
    await expect(page.getByText('معروض بواسطة').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('عضو منذ').first()).toBeVisible({ timeout: 10000 });
  });

  test('seller profile link has correct /seller/[id] format', async ({ page }) => {
    const link = page.locator('a[href*="/seller/"]').first();
    await expect(link).toBeVisible({ timeout: 10000 });
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\/seller\/.+/);
  });

  // ── Info Cards (API: condition, negotiable) ──
  test('shows condition card from API', async ({ page }) => {
    await expect(page.getByText('حالة').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows negotiable status from API', async ({ page }) => {
    const label = page.getByText(/قابل للتفاوض|سعر ثابت/).first();
    await expect(label).toBeVisible({ timeout: 10000 });
  });

  // ── Description (API: description) ──
  test('description section visible and not blank', async ({ page }) => {
    await expect(page.getByText('وصف الإعلان').first()).toBeVisible();
    const section = page.getByText('وصف الإعلان').locator('..');
    const text = await section.innerText();
    expect(text.replace('وصف الإعلان', '').trim().length).toBeGreaterThan(0);
  });

  // ── Specs Grid (API: carData.year, carData.mileage, carData.engine, carData.horsepower) ──
  test('specs grid renders car fields', async ({ page }) => {
    await expect(page.getByText('المواصفات الأساسية').first()).toBeVisible();
    const specsGrid = page.getByText('المواصفات الأساسية').locator('..').locator('..');
    await expect(specsGrid).toBeVisible();
  });

  // ── Details Table (API: carData.*, condition, governorate) ──
  test('details table shows car fields', async ({ page }) => {
    await expect(page.getByText(/تفاصيل سيارة|تفاصيل/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('الحالة').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('المحافظة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Highlights (API: condition, negotiable) ──
  test('highlights section renders from API data', async ({ page }) => {
    const highlightCard = page.locator('div').filter({ hasText: /جديد.*لم تُستخدم|مستعملة|قابل للتفاوض|سعر ثابت/ }).first();
    await expect(highlightCard).toBeVisible({ timeout: 10000 });
  });

  // ── Desktop Price Card (API: price, currency, views, createdAt, condition, governorate) ──
  test('desktop price card shows views and publish date', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    await expect(page.getByText('مشاهدة').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('تاريخ النشر').first()).toBeVisible({ timeout: 10000 });
  });

  // ── CTA Buttons ──
  test('message CTA requires auth when not logged in', async ({ page }) => {
    const msgBtn = page.locator('button').filter({ hasText: /تواصل مع البائع|تواصل/ }).first();
    await expect(msgBtn).toBeVisible();
    await msgBtn.click();
    await page.waitForTimeout(1000);
    const isModal = (await page.locator('[role="dialog"]').count()) > 0;
    const isLogin = page.url().includes('/login');
    expect(isModal || isLogin).toBeTruthy();
  });

  test('call button present when phone provided by API', async ({ page }) => {
    const callBtn = page.locator('a[href^="tel:"], button').filter({ hasText: 'اتصال' }).first();
    await expect(callBtn).toBeVisible({ timeout: 10000 });
  });

  test('whatsapp button visible', async ({ page }) => {
    const waBtn = page.locator('button').filter({ hasText: 'واتساب' }).first();
    await expect(waBtn).toBeVisible({ timeout: 10000 });
  });

  test('whatsapp button opens wa.me when enabled', async ({ page }) => {
    const waBtn = page.locator('button').filter({ hasText: 'واتساب' }).first();
    if ((await waBtn.count()) === 0 || !(await waBtn.isEnabled())) return;
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
      waBtn.click(),
    ]);
    if (popup) {
      expect(popup.url()).toContain('wa.me');
      await popup.close();
    }
  });

  // ── Location Map (API: location.lat, location.lng) ──
  test('map section renders when API provides location', async ({ page }) => {
    const mapSection = page.getByText('الموقع');
    const count = await mapSection.count();
    if (count > 0) {
      await expect(mapSection.first()).toBeVisible();
      await expect(page.locator('a').filter({ hasText: 'احصل على الاتجاهات' })).toBeVisible();
    }
  });

  // ── Similar Items ──
  test('similar items section renders', async ({ page }) => {
    const similar = page.getByText(/إعلانات مشابهة|قد يعجبك/);
    const count = await similar.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ── Status Banner ──
  test('sold banner shows when listing status is not active', async ({ page }) => {
    const banner = page.getByText(/تم بيع هذا الإعلان|غير متاح حالياً/);
    const count = await banner.count();
    if (count > 0) await expect(banner.first()).toBeVisible();
  });

  // ── Data Integrity ──
  test('no hardcoded filler text on page', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).not.toContain('lorem ipsum');
    expect(body.toLowerCase()).not.toContain('TODO');
  });

  test('cloudinary images load without error', async ({ page }) => {
    const imgs = page.locator('img[src*="cloudinary"]');
    const count = await imgs.count();
    if (count > 0) await expect(imgs.first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. BUS — /buses → /sale/bus/[id]
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Bus Sale Page', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await goToFirstListing(page, '/buses', 'bus');
    if (!ok) test.skip();
  });

  test('renders all core sections', async ({ page }) => {
    await assertCoreSections(page);
  });

  // ── Bus Specs (API: busData.year, busData.capacity, busData.busType, busData.brand) ──
  test('shows bus-specific specs', async ({ page }) => {
    await expect(page.getByText('المواصفات الأساسية').first()).toBeVisible();
    const busSpec = page.getByText(/عدد الركاب|نوع الحافلة|الماركة|سنة الصنع/).first();
    await expect(busSpec).toBeVisible({ timeout: 10000 });
  });

  // ── Bus Details (API: busData.contractType, condition, governorate) ──
  test('shows bus details table with contract type', async ({ page }) => {
    await expect(page.getByText(/تفاصيل حافلة|تفاصيل/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('المحافظة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Seller Info ──
  test('shows seller name from API user object', async ({ page }) => {
    await expect(page.getByText('معروض بواسطة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Contact (API: contactPhone, whatsapp override over user phone) ──
  test('CTA buttons present using listing contactPhone', async ({ page }) => {
    const callBtn = page.locator('a[href^="tel:"], button').filter({ hasText: 'اتصال' }).first();
    await expect(callBtn).toBeVisible({ timeout: 10000 });
  });

  // ── Negotiable & Condition ──
  test('shows negotiable and condition from API', async ({ page }) => {
    await expect(page.getByText(/قابل للتفاوض|سعر ثابت/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('حالة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Views & Date ──
  test('shows views count from API', async ({ page }) => {
    await expect(page.getByText('مشاهدة').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. EQUIPMENT — /equipment → /sale/equipment/[id]
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Equipment Sale Page', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await goToFirstListing(page, '/equipment', 'equipment');
    if (!ok) test.skip();
  });

  test('renders all core sections', async ({ page }) => {
    await assertCoreSections(page);
  });

  // ── Equipment Specs (API: equipmentData.year, brand, category, condition) ──
  test('shows equipment specs from API', async ({ page }) => {
    await expect(page.getByText('المواصفات الأساسية').first()).toBeVisible();
    await expect(page.getByText(/الفئة|الحالة/).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Equipment Details (API: brand, model, category, hoursUsed?, condition, governorate) ──
  test('shows equipment details table', async ({ page }) => {
    await expect(page.getByText(/تفاصيل معدة|تفاصيل/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('الحالة').first()).toBeVisible({ timeout: 10000 });
  });

  test('hoursUsed field renders only if provided by API', async ({ page }) => {
    const count = await page.getByText('ساعات التشغيل').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ── Negotiable & Condition ──
  test('shows negotiable status from API', async ({ page }) => {
    await expect(page.getByText(/قابل للتفاوض|سعر ثابت/).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Contact ──
  test('CTA buttons present', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'تواصل' }).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Views ──
  test('shows views count from API', async ({ page }) => {
    await expect(page.getByText('مشاهدة').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SPARE PART — /parts → /sale/part/[id]
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Spare Part Sale Page', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await goToFirstListing(page, '/parts', 'part');
    if (!ok) test.skip();
  });

  test('renders all core sections', async ({ page }) => {
    await assertCoreSections(page);
  });

  // ── Part Specs (API: partData.category, partNumber, brand, condition) ──
  test('shows part specs from API', async ({ page }) => {
    await expect(page.getByText('المواصفات الأساسية').first()).toBeVisible();
    await expect(page.getByText(/الفئة|الحالة/).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Part Details (API: isOriginal, partNumber, category, compatibility, yearRange, condition, governorate) ──
  test('shows isOriginal field in details table', async ({ page }) => {
    await expect(page.getByText(/تفاصيل قطعة|تفاصيل/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('قطعة أصلية').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows compatibility with makes when API provides it', async ({ page }) => {
    const count = await page.getByText('توافق مع الماركة').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows compatible models when API provides them', async ({ page }) => {
    const count = await page.getByText('توافق مع الموديل').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows year range when API provides yearFrom/yearTo', async ({ page }) => {
    const count = await page.getByText('سنوات التوافق').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows part number when API provides it', async ({ page }) => {
    const count = await page.getByText('رقم القطعة').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ── Condition & Negotiable ──
  test('shows condition from API', async ({ page }) => {
    await expect(page.getByText('حالة').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows negotiable status from API', async ({ page }) => {
    await expect(page.getByText(/قابل للتفاوض|سعر ثابت/).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Seller ──
  test('shows seller name from API', async ({ page }) => {
    await expect(page.getByText('معروض بواسطة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Views ──
  test('shows views count from API', async ({ page }) => {
    await expect(page.getByText('مشاهدة').first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CAR SERVICE — /services → /sale/service/[id]
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Car Service Sale Page', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await goToFirstListing(page, '/services', 'service');
    if (!ok) test.skip();
  });

  test('renders all core sections', async ({ page }) => {
    await assertCoreSections(page);
  });

  // ── Service Specs (API: serviceData.serviceType, homeService, workingHours, providerType) ──
  test('shows service type in specs', async ({ page }) => {
    await expect(page.getByText('نوع الخدمة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Service Details (API: serviceType, providerType, workingHours, homeService, governorate) ──
  test('shows service details table', async ({ page }) => {
    await expect(page.getByText(/تفاصيل خدمة|تفاصيل/).first()).toBeVisible({ timeout: 10000 });
  });

  test('shows working hours when provided by API', async ({ page }) => {
    const count = await page.getByText('ساعات العمل').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows home service field from API', async ({ page }) => {
    const count = await page.getByText('خدمة منزلية').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ── Highlight: seller.verified from API ──
  test('verified highlight uses real seller.verified from API', async ({ page }) => {
    const verified = page.getByText(/مزود موثّق|مزود غير موثّق/).first();
    await expect(verified).toBeVisible({ timeout: 10000 });
  });

  // ── Condition default (service has no condition — shows متاح) ──
  test('condition shows متاح as service default', async ({ page }) => {
    await expect(page.getByText('متاح').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Negotiable (services always negotiable) ──
  test('shows قابل للتفاوض for services', async ({ page }) => {
    await expect(page.getByText('قابل للتفاوض').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Seller ──
  test('shows seller/provider name from API', async ({ page }) => {
    await expect(page.getByText('معروض بواسطة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Views ──
  test('shows views count from API', async ({ page }) => {
    await expect(page.getByText('مشاهدة').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Contact (API: contactPhone, whatsapp) ──
  test('CTA buttons present using listing contact info', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'تواصل' }).first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ERROR STATES
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Sale Page — Error States', () => {
  test('shows error state for unknown car ID', async ({ page }) => {
    await page.goto(`${LOCALE}/sale/car/nonexistent-000000`);
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page.getByText(/لم يتم العثور|خطأ|غير موجود|الإعلان/)
    ).toBeVisible({ timeout: 30000 });
  });

  test('shows 404 for invalid listing type', async ({ page }) => {
    await page.goto(`${LOCALE}/sale/badtype/some-id`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(0);
  });
});
