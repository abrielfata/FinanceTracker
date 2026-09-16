import { test, expect } from '@playwright/test';

test('Inspect Transaksi page', async ({ page }) => {
  // Login first with email from previous run
  await page.goto('/login');
  await page.fill('input[name="email"]', 'qa_fitrack@yopmail.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const bodyText = await page.textContent('body');
  console.log("After login body:", bodyText?.substring(0, 300));
  const url = page.url();
  console.log("URL after login:", url);
  
  await page.goto('/transaksi');
  await page.waitForTimeout(2000);
  const trxBody = await page.textContent('body');
  console.log("Transaksi page body:", trxBody?.substring(0, 500));
});
