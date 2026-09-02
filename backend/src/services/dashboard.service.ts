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

export const getTrendSummary = async (userId: string) => {
  // Trend selalu menggunakan kalender normal 6 bulan terakhir
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let startMonth = currentMonth - 5;
  let startYear = currentYear;
  if (startMonth <= 0) {
    startMonth += 12;
    startYear -= 1;
  }

  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    months.push({ bulan: m, tahun: y });
  }

  const rawData = await db
    .select({
      bulan: sql<number>`CAST(EXTRACT(MONTH FROM ${transaksi.tanggal}) AS INTEGER)`,
      tahun: sql<number>`CAST(EXTRACT(YEAR FROM ${transaksi.tanggal}) AS INTEGER)`,
      pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
      pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
    })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.userId, userId),
        isNull(transaksi.deletedAt),
        sql`(${transaksi.tanggal} >= MAKE_DATE(${startYear}, ${startMonth}, 1))`
      )
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${transaksi.tanggal})`,
      sql`EXTRACT(MONTH FROM ${transaksi.tanggal})`
    );

  const trendData = months.map(m => {
    const found = rawData.find(r => r.bulan === m.bulan && r.tahun === m.tahun);
    return {
      bulan: m.bulan,
      tahun: m.tahun,
      pemasukan: found ? Number(found.pemasukan) : 0,
      pengeluaran: found ? Number(found.pengeluaran) : 0,
    };
  });

  return trendData;
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
