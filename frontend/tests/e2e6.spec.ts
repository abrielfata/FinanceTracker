import { test } from '@playwright/test';

test('Check register error', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/register');
  await page.fill('input[name="nama"]', 'Test Transaksi');
  await page.fill('input[name="email"]', `user${ts}@example.com`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log("Body text:", await page.textContent('body'));
});
