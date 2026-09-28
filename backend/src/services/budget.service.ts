import { db } from '../db';
import { budget, NewBudget } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError } from '../utils/errors';

export const getSpendingSubquery = (userId: string, startDate: string, endDate: string) => {
  return sql<number>`CAST(COALESCE((
    SELECT SUM(t.nominal) FROM transaksi t
    WHERE t.user_id = ${userId}
      AND t.jenis = 'pengeluaran'
      AND t.kategori = budget.kategori
      AND t.is_budgeted = true
      AND t.tanggal >= ${startDate}
      AND t.tanggal <= ${endDate}
      AND t.deleted_at IS NULL
  ), 0) AS DOUBLE PRECISION)`;
};

export const autoCopyPreviousBudget = async (userId: string, targetBulan: number, targetTahun: number) => {
  // Check if target month already has budgets
  const existingTargetBudgets = await db
    .select({ id: budget.id })
    .from(budget)
    .where(and(eq(budget.userId, userId), eq(budget.bulan, targetBulan), eq(budget.tahun, targetTahun)))
    .limit(1);

  if (existingTargetBudgets.length > 0) {
    return; // Already configured for target month
  }

  // Find most recent past budget month for this user
  const recentPastBudget = await db
    .select({ bulan: budget.bulan, tahun: budget.tahun })
    .from(budget)
    .where(
      and(
        eq(budget.userId, userId),
        sql`(${budget.tahun} < ${targetTahun} OR (${budget.tahun} = ${targetTahun} AND ${budget.bulan} < ${targetBulan}))`
      )
    )
    .orderBy(sql`${budget.tahun} DESC, ${budget.bulan} DESC`)
    .limit(1);

  if (recentPastBudget.length === 0) {
    return; // No previous budgets to copy from
  }

  const { bulan: prevBulan, tahun: prevTahun } = recentPastBudget[0];

  // Fetch all budgets from that previous month
  const pastBudgets = await db
    .select({ kategori: budget.kategori, nominal: budget.nominal })
    .from(budget)
    .where(and(eq(budget.userId, userId), eq(budget.bulan, prevBulan), eq(budget.tahun, prevTahun)));

  if (pastBudgets.length === 0) return;

  // Auto insert budgets into target month
  const newBudgetValues = pastBudgets.map((b) => ({
    userId,
    kategori: b.kategori,
    nominal: Number(b.nominal),
    bulan: targetBulan,
    tahun: targetTahun,
  }));

  await db.insert(budget).values(newBudgetValues).onConflictDoNothing();
};

export const getBudgetList = async (userId: string, bulanNum: number, tahunNum: number, startDate: string, endDate: string) => {
  // Auto carry forward budget from previous month if not yet set for target month
  await autoCopyPreviousBudget(userId, bulanNum, tahunNum);

  const result = await db
    .select({
      id: budget.id,
      kategori: budget.kategori,
      nominal: budget.nominal,
      bulan: budget.bulan,
      tahun: budget.tahun,
      terpakai: getSpendingSubquery(userId, startDate, endDate),
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

  return result.map((item) => ({
    ...item,
    nominal: Number(item.nominal),
    terpakai: Number(item.terpakai) || 0,
  }));
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
