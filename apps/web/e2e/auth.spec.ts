import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    const ts = Date.now();
    
    // Fill registration form using placeholder selectors
    await page.fill('input[placeholder="مثال: ahmad_95"]', `user_${ts}`);
    await page.fill('input[placeholder="name@example.com"]', `test${ts}@test.com`);
    await page.fill('input[placeholder="9XXXXXXX"]', '99999999');
    await page.fill('input[type="password"]', 'Test1234');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('should login with existing credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'seller@carone.om');
    await page.fill('input[type="password"]', 'Test1234');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    // Should see logout button (user is logged in)
    await expect(page.locator('button[title="تسجيل خروج"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.bg-error-container')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'seller@carone.om');
    await page.fill('input[type="password"]', 'Test1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Click logout button directly
    await page.click('button[title="تسجيل خروج"]');
    
    // Should redirect to home (not logged in anymore)
    await page.waitForURL('/');
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});
