import { test, expect } from '@playwright/test';

test.describe('Modul 1: Auth', () => {
  test('AUTH-HP-001: Register & AUTH-HP-002: Login', async ({ page }) => {
    const ts = Date.now();
    const email = `test${ts}@example.com`;
    
    // Register
    await page.goto('/register');
    await page.fill('input[name="nama"]', 'Tester QA');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Should be redirected to dashboard directly per Register.tsx line 45 (navigate('/'))
    await expect(page).toHaveURL('http://localhost:5173/');
    
    // Logout
    await page.goto('/pengaturan');
    await page.click('button:has-text("Logout")');
    await page.click('button:has-text("Konfirmasi")'); // ConfirmDialog
    
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('AUTH-NEG-001: Register form kosong', async ({ page }) => {
    await page.goto('/register');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Nama minimal 2 karakter')).toBeVisible();
    await expect(page.locator('text=Email tidak valid')).toBeVisible();
  });

  test('AUTH-NEG-004: Login wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email atau password salah')).toBeVisible({ timeout: 5000 });
  });
});
