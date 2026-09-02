import { db } from '../db';
import { budget, NewBudget } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError } from '../utils/errors';

export const getSpendingSubquery = (userId: string, bulan: number, tahun: number) => {
  return sql<number>`COALESCE((
    SELECT SUM(t.nominal) FROM transaksi t
    WHERE t.user_id = ${userId}
      AND t.jenis = 'pengeluaran'
      AND t.kategori = ${budget.kategori}
      AND EXTRACT(MONTH FROM t.tanggal) = ${bulan}
      AND EXTRACT(YEAR FROM t.tanggal) = ${tahun}
  ), 0)`;
};

export const getBudgetList = async (userId: string, bulanNum: number, tahunNum: number) => {
  return await db
    .select({
      id: budget.id,
      kategori: budget.kategori,
      nominal: budget.nominal,
      bulan: budget.bulan,
      tahun: budget.tahun,
      terpakai: getSpendingSubquery(userId, bulanNum, tahunNum),
    })
    .from(budget)
    .where(
      and(
        eq(budget.userId, userId),
        eq(budget.bulan, bulanNum),
        eq(budget.tahun, tahunNum)
      )
    )
    .orderBy(budget.kategori);
};

export const createOrUpdateBudget = async (userId: string, data: Omit<NewBudget, 'userId'>) => {
  const [newBudget] = await db
    .insert(budget)
    .values({ ...data, userId })
    .onConflictDoUpdate({
      target: [budget.userId, budget.kategori, budget.bulan, budget.tahun],
      set: { nominal: data.nominal },
    })
    .returning();

  return newBudget;
};

export const updateBudgetNominal = async (userId: string, budgetId: string, nominal: number) => {
  const [updatedBudget] = await db
    .update(budget)
    .set({ nominal })
    .where(and(eq(budget.id, budgetId), eq(budget.userId, userId)))
    .returning();

  if (!updatedBudget) {
    throw new NotFoundError('Budget tidak ditemukan');
  }

  return updatedBudget;
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  const [deletedBudget] = await db
    .delete(budget)
    .where(and(eq(budget.id, budgetId), eq(budget.userId, userId)))
    .returning({ id: budget.id });

  if (!deletedBudget) {
    throw new NotFoundError('Budget tidak ditemukan');
  }
};
