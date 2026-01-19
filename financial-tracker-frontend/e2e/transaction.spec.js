import { test, expect } from '@playwright/test';

test.describe('Transaction Flow', () => {
  test('should register and add a new transaction', async ({ page }) => {
    const timestamp = Date.now();
    const username = `user_${timestamp}`;
    const email = `e2e_${timestamp}@example.com`;
    const password = 'Password123!';

    // 1. Visit App
    await page.goto('/');

    // 2. Nav to Register
    await page.click('button:has-text("Don\'t have an account? Create one")');
    
    // 3. Fill Registration
    await page.fill('[placeholder="Choose a username"]', username);
    await page.fill('[placeholder="name@example.com"]', email);
    // Use nth to distinguish between Password and Confirm Password inputs
    await page.fill('[placeholder="••••••••"] >> nth=0', password); 
    await page.fill('[placeholder="••••••••"] >> nth=1', password); 
    
    await page.click('button:has-text("Get Started")');

    // 4. Wait for redirection to dashboard (look for h2)
    await expect(page.locator('h2:has-text("New Transaction")')).toBeVisible({ timeout: 15000 });
    
    // 5. Fill Transaction Form
    await page.fill('input[name="usedFor"]', 'E2E Pizza');
    await page.fill('input[name="debit"]', '35');
    await page.selectOption('select', 'USD');

    // 6. Submit
    await page.click('button:has-text("Add Transaction")');

    // 7. Verify
    await expect(page.locator('text=E2E Pizza')).toBeVisible();
    await expect(page.locator('text=35.00 USD')).toBeVisible();
  });
});
