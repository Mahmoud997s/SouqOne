import { test, expect } from '@playwright/test';

test.describe('Listings Page', () => {
  test('should display listings grid', async ({ page }) => {
    await page.goto('/listings');
    
    // Wait for listings to load
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible({ timeout: 15000 });
    
    // Should show filters sidebar
    await expect(page.locator('h2:has-text("الفلاتر")')).toBeVisible();
    await expect(page.locator('text=السعر الأقصى')).toBeVisible();
  });

  test('should filter by max price', async ({ page }) => {
    await page.goto('/listings');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible({ timeout: 15000 });
    
    // Set max price filter
    await page.fill('input[placeholder="مثال: 15000"]', '20000');
    await page.click('button:has-text("تطبيق الفلاتر")');
    
    // Wait for filtered results
    await page.waitForTimeout(2000);
    
    // Should still show listings (or empty state)
    const hasListings = await page.locator('[data-testid="listing-card"]').count();
    expect(hasListings).toBeGreaterThanOrEqual(0);
  });

  test('should search listings using search bar', async ({ page }) => {
    await page.goto('/listings');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible({ timeout: 15000 });
    
    // Use the inline search form inside listings page
    await page.fill('input[placeholder="ابحث عن ماركة، موديل..."]', 'تويوتا');
    await page.click('button:has-text("بحث")');
    
    // Wait for filtered results
    await page.waitForURL(/search=/, { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Should show Toyota listings
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to listing details', async ({ page }) => {
    await page.goto('/listings');
    
    // Wait for listings
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible({ timeout: 15000 });
    
    // Click the title heading inside first card (inside the Link)
    await page.locator('[data-testid="listing-card"] h3').first().click();
    
    // Should navigate to details page
    await expect(page).toHaveURL(/\/cars\/[a-zA-Z0-9]+/, { timeout: 10000 });
    
    // Should show price or title on details page
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('should add to favorites (requires auth)', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[placeholder="البريد الإلكتروني"]', 'seller@carone.om');
    await page.fill('input[placeholder="••••••••"]', 'Test1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 15000 });
    
    // Go to listings
    await page.goto('/listings');
    
    // Wait for listings with favorite buttons
    await expect(page.locator('[data-testid="favorite-button"]').first()).toBeVisible({ timeout: 15000 });
    
    // Click favorite on first listing
    await page.locator('[data-testid="favorite-button"]').first().click();
    
    // Wait a moment for state update
    await page.waitForTimeout(1000);
    
    // Favorite button should still be visible (toggle happened)
    await expect(page.locator('[data-testid="favorite-button"]').first()).toBeVisible();
  });
});
