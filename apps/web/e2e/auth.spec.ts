import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login with existing credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[placeholder="البريد الإلكتروني"]', 'seller@carone.om');
    await page.fill('input[placeholder="••••••••"]', 'Test1234');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 15000 });

    // Should NOT see the login link anymore (user is logged in)
    await expect(page.locator('a[href="/login"]')).toHaveCount(0, { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[placeholder="البريد الإلكتروني"]', 'wrong@email.com');
    await page.fill('input[placeholder="••••••••"]', 'wrongpass');

    await page.click('button[type="submit"]');

    // Should show error message (red error box)
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.click('a[href="/forgot-password"]');

    // Should be on forgot password page
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('h1:has-text("استعادة كلمة المرور")')).toBeVisible();
  });

  test('should render register page correctly', async ({ page }) => {
    await page.goto('/register');

    // Title should be visible
    await expect(page.locator('h1:has-text("إنشاء حساب")')).toBeVisible();

    // All required fields should exist
    await expect(page.locator('input[placeholder="اسم المستخدم"]')).toBeVisible();
    await expect(page.locator('input[placeholder="البريد الإلكتروني"]')).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();

    // Submit should be disabled without agreeing to terms
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Check terms and button should enable
    await page.check('input[type="checkbox"]');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should lose access after clearing auth tokens', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[placeholder="البريد الإلكتروني"]', 'seller@carone.om');
    await page.fill('input[placeholder="••••••••"]', 'Test1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 20000 });

    // Clear auth tokens (simulates logout)
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    // Navigating to a protected page should redirect to login
    await page.goto('/profile');
    await page.waitForTimeout(2000);

    // Should see login link or be on login page
    const isOnLogin = page.url().includes('/login');
    const hasLoginLink = await page.locator('a[href="/login"]').count() > 0;
    expect(isOnLogin || hasLoginLink).toBeTruthy();
  });
});
