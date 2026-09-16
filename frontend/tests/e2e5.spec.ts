import { test, expect } from '@playwright/test';

test('Test Transaksi flow', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/register');
  await page.fill('input[name="nama"]', 'Test Transaksi');
  await page.fill('input[name="email"]', `user${ts}@example.com`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  
  await page.goto('/transaksi');
  await page.waitForTimeout(1000);
  
  // Click Tambah button
  await page.click('button:has-text("Tambah")');
  await page.waitForTimeout(500);
  
  // Inspect modal content
  const modalText = await page.textContent('.fixed');
  console.log("Modal text:", modalText?.replace(/\n/g, ' '));
});
