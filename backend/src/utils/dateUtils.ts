import { sql } from 'drizzle-orm';

// Tanggal mulai siklus finansial (cutoff).
// Saat ini di-hardcode ke 25. Jika suatu saat ingin dibuat dinamis per user,
// nilai ini bisa diambil dari tabel users.
export const CUTOFF_DAY = 25;

/**
 * Helper untuk mendapatkan "Bulan Finansial" dari sebuah tanggal.
 * Jika tanggal transaksi >= CUTOFF_DAY, maka dianggap masuk bulan berikutnya.
 * Contoh: 28 Agustus -> September (9).
 */
export const getFinancialMonthSql = (dateColumn: any) => sql`
  CASE
    WHEN EXTRACT(DAY FROM ${dateColumn}) >= ${CUTOFF_DAY} THEN
      CASE WHEN EXTRACT(MONTH FROM ${dateColumn}) = 12 THEN 1 ELSE EXTRACT(MONTH FROM ${dateColumn}) + 1 END
    ELSE EXTRACT(MONTH FROM ${dateColumn})
  END
`;

/**
 * Helper untuk mendapatkan "Tahun Finansial" dari sebuah tanggal.
 * Jika tanggal transaksi >= CUTOFF_DAY di bulan Desember, maka dianggap masuk tahun berikutnya.
 * Contoh: 28 Desember 2026 -> Tahun 2027.
 */
export const getFinancialYearSql = (dateColumn: any) => sql`
  CASE
    WHEN EXTRACT(DAY FROM ${dateColumn}) >= ${CUTOFF_DAY} AND EXTRACT(MONTH FROM ${dateColumn}) = 12 THEN EXTRACT(YEAR FROM ${dateColumn}) + 1
    ELSE EXTRACT(YEAR FROM ${dateColumn})
  END
`;
