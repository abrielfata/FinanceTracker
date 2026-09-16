import { test, expect } from '@playwright/test';

test('Inspect Transaksi page properly', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/register');
  await page.fill('input[name="nama"]', 'Test Transaksi');
  await page.fill('input[name="email"]', `user${ts}@example.com`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  console.log("URL after register:", page.url());
  
  await page.goto('/transaksi');
  await page.waitForTimeout(2000);
  const trxBody = await page.textContent('body');
  console.log("Transaksi page body:", trxBody?.substring(0, 1000).replace(/\n/g, ' '));
});
