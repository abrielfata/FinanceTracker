import { db } from '../db';
import { transaksi, tagihan, tagihanBulan, budget } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSpendingSubquery } from './budget.service';

export const getDashboardSummary = async (userId: string, bulanNum: number, tahunNum: number) => {
  // 1. Total pemasukan & pengeluaran bulan ini
  const [summary] = await db
    .select({
      pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
      pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
    })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.userId, userId),
        sql`EXTRACT(MONTH FROM ${transaksi.tanggal}) = ${bulanNum}`,
        sql`EXTRACT(YEAR FROM ${transaksi.tanggal}) = ${tahunNum}`
      )
    );

  // 2. Tagihan terdekat (belum lunas, bulan ini, max 5)
  const tagihanTerdekat = await db
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
    .where(eq(tagihan.userId, userId))
    .orderBy(tagihan.tanggalJatuhTempo)
    .limit(5);

  // 3. Budget summary dengan spending
  const budgetSummary = await db
    .select({
      id: budget.id,
      kategori: budget.kategori,
      nominal: budget.nominal,
      terpakai: getSpendingSubquery(userId, bulanNum, tahunNum),
    })
    .from(budget)
    .where(
      and(
        eq(budget.userId, userId),
        eq(budget.bulan, bulanNum),
        eq(budget.tahun, tahunNum)
      )
    );

  // 4. Saldo bulan lalu (untuk persentase perubahan)
  const bulanLalu = bulanNum === 1 ? 12 : bulanNum - 1;
  const tahunLalu = bulanNum === 1 ? tahunNum - 1 : tahunNum;

  const [summaryLalu] = await db
    .select({
      pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
      pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
    })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.userId, userId),
        sql`EXTRACT(MONTH FROM ${transaksi.tanggal}) = ${bulanLalu}`,
        sql`EXTRACT(YEAR FROM ${transaksi.tanggal}) = ${tahunLalu}`
      )
    );

  const pemasukan = Number(summary.pemasukan) || 0;
  const pengeluaran = Number(summary.pengeluaran) || 0;
  const saldo = pemasukan - pengeluaran;
  const saldoLalu = Number(summaryLalu.pemasukan || 0) - Number(summaryLalu.pengeluaran || 0);
  const persenSaldo = saldoLalu > 0
    ? ((saldo - saldoLalu) / saldoLalu) * 100
    : 0;

  return {
    bulan: bulanNum,
    tahun: tahunNum,
    saldo,
    pemasukan,
    pengeluaran,
    persenSaldo: Math.round(persenSaldo * 10) / 10,
    tagihanTerdekat,
    budgetSummary,
  };
};

export const getTrendSummary = async (userId: string) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const trendData = [];

  // Get data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }

    const [summary] = await db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN nominal ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN nominal ELSE 0 END), 0)`,
      })
      .from(transaksi)
      .where(
        and(
          eq(transaksi.userId, userId),
          sql`EXTRACT(MONTH FROM ${transaksi.tanggal}) = ${m}`,
          sql`EXTRACT(YEAR FROM ${transaksi.tanggal}) = ${y}`
        )
      );

    trendData.push({
      bulan: m,
      tahun: y,
      pemasukan: Number(summary.pemasukan),
      pengeluaran: Number(summary.pengeluaran),
    });
  }

  return trendData;
};
