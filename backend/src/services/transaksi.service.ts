import { db } from '../db';
import { transaksi, NewTransaksi } from '../db/schema';
import { eq, and, sql, isNull, gte, lte } from 'drizzle-orm';
import { NotFoundError } from '../utils/errors';

interface TransaksiFilters {
  startDate?: string;
  endDate?: string;
  jenis?: string;
  page?: string;
  limit?: string;
}

export const getTransaksiList = async (userId: string, filters: TransaksiFilters) => {
  const { startDate, endDate, jenis, page = '1', limit = '10' } = filters;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [
    eq(transaksi.userId, userId),
    isNull(transaksi.deletedAt),
  ];

  if (startDate && endDate) {
    conditions.push(gte(transaksi.tanggal, startDate));
    conditions.push(lte(transaksi.tanggal, endDate));
  }

  if (jenis && (jenis === 'pemasukan' || jenis === 'pengeluaran')) {
    conditions.push(eq(transaksi.jenis, jenis));
  }

  const [data, countResult] = await Promise.all([
    db.select()
      .from(transaksi)
      .where(and(...conditions))
      .orderBy(sql`${transaksi.tanggal} DESC, ${transaksi.createdAt} DESC`)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`COUNT(*)` })
      .from(transaksi)
      .where(and(...conditions)),
  ]);

  return {
    data,
    meta: {
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(Number(countResult[0].count) / limitNum),
    },
  };
};

export const createTransaksi = async (data: NewTransaksi) => {
  const [newTransaksi] = await db.insert(transaksi).values(data).returning();
  return newTransaksi;
};

export const updateTransaksi = async (userId: string, transaksiId: string, data: Partial<NewTransaksi>) => {
  const [updatedTransaksi] = await db.update(transaksi)
    .set(data)
    .where(and(eq(transaksi.id, transaksiId), eq(transaksi.userId, userId)))
    .returning();

  if (!updatedTransaksi) {
    throw new NotFoundError('Transaksi tidak ditemukan');
  }

  return updatedTransaksi;
};

export const deleteTransaksi = async (userId: string, transaksiId: string) => {
  const [deletedTransaksi] = await db.update(transaksi)
    .set({ deletedAt: new Date() })
    .where(and(eq(transaksi.id, transaksiId), eq(transaksi.userId, userId)))
    .returning({ id: transaksi.id });

  if (!deletedTransaksi) {
    throw new NotFoundError('Transaksi tidak ditemukan');
  }
};
