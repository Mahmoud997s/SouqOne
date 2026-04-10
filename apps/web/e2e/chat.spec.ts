import { test, expect } from '@playwright/test';

test.describe('Real-Time Chat', () => {
  test('should send and receive messages in real-time', async ({ browser }) => {
    // Create two browser contexts (two users)
    const buyerContext = await browser.newContext();
    const sellerContext = await browser.newContext();
    
    const buyerPage = await buyerContext.newPage();
    const sellerPage = await sellerContext.newPage();
    
    // Login as buyer
    await buyerPage.goto('/login');
    await buyerPage.fill('input[type="email"]', 'ahmed@carone.om');
    await buyerPage.fill('input[type="password"]', 'Test1234');
    await buyerPage.click('button[type="submit"]');
    await buyerPage.waitForURL('/');
    
    // Login as seller
    await sellerPage.goto('/login');
    await sellerPage.fill('input[type="email"]', 'seller@carone.om');
    await sellerPage.fill('input[type="password"]', 'Test1234');
    await sellerPage.click('button[type="submit"]');
    await sellerPage.waitForURL('/');
    
    // Buyer starts a conversation from a listing
    await buyerPage.goto('/listings');
    await buyerPage.locator('[data-testid="listing-card"]').first().click();
    await buyerPage.click('button:has-text("أرسل رسالة")');
    
    // Buyer sends a message
    const buyerMessage = 'مرحباً، هل السيارة متاحة؟';
    await buyerPage.fill('textarea[placeholder*="اكتب رسالة"]', buyerMessage);
    await buyerPage.press('textarea', 'Enter');
    
    // Buyer should see their message
    await expect(buyerPage.locator(`text=${buyerMessage}`)).toBeVisible();
    
    // Seller goes to messages
    await sellerPage.goto('/messages');
    
    // Seller should see new conversation (real-time update)
    await expect(sellerPage.locator('text=أحمد الحارثي')).toBeVisible({ timeout: 5000 });
    await expect(sellerPage.locator(`text=${buyerMessage}`)).toBeVisible();
    
    // Seller clicks on conversation
    await sellerPage.locator('text=أحمد الحارثي').click();
    
    // Seller should see buyer's message
    await expect(sellerPage.locator(`text=${buyerMessage}`)).toBeVisible();
    
    // Seller sends a reply
    const sellerReply = 'نعم متاحة للمعاينة';
    await sellerPage.fill('textarea[placeholder*="اكتب رسالة"]', sellerReply);
    await sellerPage.press('textarea', 'Enter');
    
    // Buyer should receive reply instantly (real-time)
    await expect(buyerPage.locator(`text=${sellerReply}`)).toBeVisible({ timeout: 5000 });
    
    // Cleanup
    await buyerContext.close();
    await sellerContext.close();
  });

  test('should show typing indicator', async ({ browser }) => {
    const buyerContext = await browser.newContext();
    const sellerContext = await browser.newContext();
    
    const buyerPage = await buyerContext.newPage();
    const sellerPage = await sellerContext.newPage();
    
    // Login both users and navigate to chat (setup omitted for brevity)
    // ... similar to previous test
    
    // Buyer starts typing
    await buyerPage.fill('textarea[placeholder*="اكتب رسالة"]', 'مرحب');
    
    // Seller should see typing indicator
    await expect(sellerPage.locator('text=يكتب...')).toBeVisible({ timeout: 3000 });
    
    // Buyer stops typing
    await buyerPage.waitForTimeout(3000);
    
    // Typing indicator should disappear
    await expect(sellerPage.locator('text=يكتب...')).not.toBeVisible();
    
    await buyerContext.close();
    await sellerContext.close();
  });
});
