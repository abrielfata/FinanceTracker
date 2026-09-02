import { db } from '../db';
import { transaksi, tagihan, tagihanBulan, budget } from '../db/schema';
import { eq, and, sql, isNull, gte, lte } from 'drizzle-orm';
import { getSpendingSubquery } from './budget.service';

export const getDashboardSummary = async (userId: string, bulanNum: number, tahunNum: number, startDate: string, endDate: string) => {
  // Hitung range tanggal untuk bulan lalu
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const prevStart = new Date(start);
  prevStart.setMonth(prevStart.getMonth() - 1);
  const prevEnd = new Date(end);
  prevEnd.setMonth(prevEnd.getMonth() - 1);

  const startDateLalu = prevStart.toISOString().split('T')[0];
  const endDateLalu = prevEnd.toISOString().split('T')[0];

  const [
    [summary],
    tagihanTerdekat,
    budgetSummary,
    [summaryLalu]
  ] = await Promise.all([
    // 1. Total pemasukan & pengeluaran bulan ini (berdasarkan custom date range)
    db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
      })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.userId, userId),
          isNull(transaksi.deletedAt),
          gte(transaksi.tanggal, startDate),
          lte(transaksi.tanggal, endDate)
        )
      ),

    // 2. Tagihan terdekat (belum lunas, berdasar bulan kalender)
    db
      .select({
        id: tagihan.id,
        nama: tagihan.nama,
        nominal: tagihan.nominal,
        tanggalJatuhTempo: tagihan.tanggalJatuhTempo,
        kategori: tagihan.kategori,
        status: tagihanBulan.status,
        tagihanBulanId: tagihanBulan.id,
      })
      .from(tagihan)
      .leftJoin(
        tagihanBulan,
        and(
          eq(tagihanBulan.tagihanId, tagihan.id),
          eq(tagihanBulan.bulan, bulanNum),
          eq(tagihanBulan.tahun, tahunNum)
        )
      )
      .where(
        and(
          eq(tagihan.userId, userId),
          isNull(tagihan.deletedAt)
        )
      )
      .orderBy(tagihan.tanggalJatuhTempo)
      .limit(5),

    // 3. Budget summary dengan spending (menggunakan date range di subquery)
    db
      .select({
        id: budget.id,
        kategori: budget.kategori,
        nominal: budget.nominal,
        terpakai: getSpendingSubquery(userId, startDate, endDate),
      })
      .from(budget)
      .where(
        and(
          eq(budget.userId, userId),
          eq(budget.bulan, bulanNum),
          eq(budget.tahun, tahunNum)
        )
      ),

    // 4. Saldo bulan lalu (untuk persentase perubahan)
    db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
      })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.userId, userId),
          isNull(transaksi.deletedAt),
          gte(transaksi.tanggal, startDateLalu),
          lte(transaksi.tanggal, endDateLalu)
        )
      )
  ]);

  const pemasukan = Number(summary?.pemasukan) || 0;
  const pengeluaran = Number(summary?.pengeluaran) || 0;
  const saldo = pemasukan - pengeluaran;
  
  const pemasukanLalu = Number(summaryLalu?.pemasukan) || 0;
  const pengeluaranLalu = Number(summaryLalu?.pengeluaran) || 0;
  const saldoLalu = pemasukanLalu - pengeluaranLalu;
  
  const persenSaldo = saldoLalu > 0
    ? ((saldo - saldoLalu) / saldoLalu) * 100
    : 0;

  return {
    bulan: bulanNum,
    tahun: tahunNum,
    startDate,
    endDate,
    saldo,
    pemasukan,
    pengeluaran,
    persenSaldo: Math.round(persenSaldo * 10) / 10,
    tagihanTerdekat,
    budgetSummary,
  };
};

export const getTrendSummary = async (userId: string, filterStartDate?: string, filterEndDate?: string) => {
  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();
  let baseStart: Date;
  let baseEnd: Date;

  if (filterStartDate && filterEndDate) {
    baseStart = new Date(filterStartDate);
    baseEnd = new Date(filterEndDate);
  } else {
    // Default siklus bulan ini
    let startM = currentBulan - 1;
    let startY = currentTahun;
    if (startM === 0) {
      startM = 12;
      startY -= 1;
    }
    baseStart = new Date(startY, startM - 1, 26);
    baseEnd = new Date(currentTahun, currentBulan - 1, 25);
  }

  // Generate 6 periods relative to base dates
  const periods = [];
  for (let i = 0; i < 6; i++) {
    // Subtract i months from baseStart and baseEnd
    const s = new Date(baseStart.getFullYear(), baseStart.getMonth() - i, baseStart.getDate());
    const e = new Date(baseEnd.getFullYear(), baseEnd.getMonth() - i, baseEnd.getDate());
    periods.unshift({
      start: s.toISOString().split('T')[0],
      end: e.toISOString().split('T')[0],
      labelMonth: e.getMonth() + 1,
      labelYear: e.getFullYear()
    });
  }
  // periods are ordered oldest to newest

  const promises = periods.map(async (p) => {
    const [result] = await db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
      })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.userId, userId),
          isNull(transaksi.deletedAt),
          sql`${transaksi.tanggal} >= ${p.start}`,
          sql`${transaksi.tanggal} <= ${p.end}`
        )
      );

    return {
      bulan: p.labelMonth,
      tahun: p.labelYear,
      pemasukan: Number(result?.pemasukan || 0),
      pengeluaran: Number(result?.pengeluaran || 0)
    };
  });

  return await Promise.all(promises);
};

export const getAllExportData = async (userId: string) => {
  const [transaksiData, tagihanData, budgetData] = await Promise.all([
    db
      .select({
        id: transaksi.id,
        jenis: transaksi.jenis,
        nominal: transaksi.nominal,
        kategori: transaksi.kategori,
        deskripsi: transaksi.deskripsi,
        tanggal: transaksi.tanggal,
      })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.userId, userId),
          isNull(transaksi.deletedAt)
        )
      )
      .orderBy(sql`${transaksi.tanggal} DESC`),
    
    db
      .select({
        id: tagihan.id,
        nama: tagihan.nama,
        nominal: tagihan.nominal,
        tanggalJatuhTempo: tagihan.tanggalJatuhTempo,
        kategori: tagihan.kategori,
        isBerulang: tagihan.isBerulang,
        catatan: tagihan.catatan,
      })
      .from(tagihan)
      .where(
        and(
          eq(tagihan.userId, userId),
          isNull(tagihan.deletedAt)
        )
      )
      .orderBy(tagihan.tanggalJatuhTempo),
      
    db
      .select({
        id: budget.id,
        bulan: budget.bulan,
        tahun: budget.tahun,
        kategori: budget.kategori,
        nominal: budget.nominal,
      })
      .from(budget)
      .where(eq(budget.userId, userId))
      .orderBy(sql`${budget.tahun} DESC, ${budget.bulan} DESC`)
  ]);

  return {
    transaksi: transaksiData,
    tagihan: tagihanData,
    budget: budgetData
  };
};
