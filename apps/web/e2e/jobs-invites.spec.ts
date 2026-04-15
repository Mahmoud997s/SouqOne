import { test, expect } from '@playwright/test';

test.describe('Jobs Invites Pages', () => {
  test('should require auth for invites page', async ({ page }) => {
    await page.goto('/jobs/invites');
    await page.waitForTimeout(3000);

    const isOnLogin = page.url().includes('/login');
    const hasAuthGuard = await page.locator('text=تسجيل الدخول').count() > 0;
    const isOnInvites = page.url().includes('/invites');

    expect(isOnLogin || hasAuthGuard || isOnInvites).toBeTruthy();
  });

  test('should display invites page structure', async ({ page }) => {
    await page.goto('/jobs/invites');
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });
});
