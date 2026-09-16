import { test, expect } from '@playwright/test';

test.describe('Modul 2: Transaksi', () => {
  let userEmail = `user${Date.now()}@example.com`;

  test('Transaksi CRUD', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="nama"]', 'Test Transaksi');
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:5173/');

    await page.goto('/transaksi');
    
    // TRX-HP-001: Tambah Transaksi Pemasukan
    await page.click('button:has-text("Tambah")');
    await page.click('button:has-text("Pemasukan")');
    
    await page.fill('input#nominal', '500000');
    await page.selectOption('select#kategori', { index: 1 });
    await page.fill('textarea#deskripsi', 'Gaji bulanan');
    await page.click('button:has-text("Simpan")');
    
    await expect(page.locator('button:has-text("Batal")')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=500.000')).toBeVisible({ timeout: 5000 });

    // TRX-NEG-001: Tambah Transaksi nominal 0
    await page.click('button:has-text("Tambah")');
    await page.fill('input#nominal', '0');
    await page.click('button:has-text("Simpan")');
    
    await expect(page.locator('text=Nominal harus lebih dari 0')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Batal")');

    // Edit Transaction
    await page.click('span:has-text("edit")');
    await page.fill('input#nominal', '600000');
    await page.click('button:has-text("Simpan")');
    await expect(page.locator('button:has-text("Batal")')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=600.000')).toBeVisible({ timeout: 5000 });

    // TRX-HP-004: Hapus Transaksi
    await page.click('span:has-text("delete")');
    await page.click('button:has-text("Ya, Lanjutkan")');
    
    await expect(page.locator('text=600.000')).not.toBeVisible({ timeout: 5000 });
  });
});
