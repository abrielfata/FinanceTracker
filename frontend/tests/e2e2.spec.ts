import { test, expect } from '@playwright/test';

test('Test Login error message', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'wrong@example.com');
  await page.fill('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  
  // Wait a bit
  await page.waitForTimeout(2000);
  
  // Log the body
  const bodyText = await page.textContent('body');
  console.log("Body text:", bodyText);
});
