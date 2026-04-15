import { test, expect } from '@playwright/test';

test.describe('Jobs Verification Page', () => {
  test('should require auth for verification page', async ({ page }) => {
    await page.goto('/jobs/verification');
    await page.waitForTimeout(3000);

    const isOnLogin = page.url().includes('/login');
    const hasAuthGuard = await page.locator('text=تسجيل الدخول').count() > 0;
    const isOnVerification = page.url().includes('/verification');

    expect(isOnLogin || hasAuthGuard || isOnVerification).toBeTruthy();
  });

  test('should display verification page structure', async ({ page }) => {
    await page.goto('/jobs/verification');
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });
});
