import { db } from '../db';
import { savingGoals, type SavingGoal, type NewSavingGoal } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../utils/errors';

export class SavingGoalService {
  static async getAll(userId: string) {
    return db
      .select()
      .from(savingGoals)
      .where(eq(savingGoals.userId, userId))
      .orderBy(desc(savingGoals.createdAt));
  }

  static async getById(userId: string, id: string) {
    const [goal] = await db
      .select()
      .from(savingGoals)
      .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, userId)))
      .limit(1);

    if (!goal) throw new NotFoundError('Target tabungan tidak ditemukan');
    return goal;
  }

  static async create(userId: string, data: Omit<NewSavingGoal, 'id' | 'userId' | 'createdAt'>) {
    if (!data.nama?.trim()) throw new ValidationError('Nama target tabungan wajib diisi');
    if (!data.targetNominal || Number(data.targetNominal) <= 0) {
      throw new ValidationError('Target nominal harus lebih besar dari 0');
    }

    const [created] = await db
      .insert(savingGoals)
      .values({
        ...data,
        userId,
        terkumpulNominal: Number(data.terkumpulNominal) || 0,
        isCompleted: Number(data.terkumpulNominal) >= Number(data.targetNominal),
      })
      .returning();

    return created;
  }

  static async update(
    userId: string,
    id: string,
    data: Partial<Omit<NewSavingGoal, 'id' | 'userId' | 'createdAt'>>
  ) {
    const existing = await this.getById(userId, id);

    const targetNominal = data.targetNominal !== undefined ? Number(data.targetNominal) : existing.targetNominal;
    const terkumpulNominal =
      data.terkumpulNominal !== undefined ? Number(data.terkumpulNominal) : existing.terkumpulNominal;

    const [updated] = await db
      .update(savingGoals)
      .set({
        ...data,
        targetNominal,
        terkumpulNominal,
        isCompleted: terkumpulNominal >= targetNominal,
      })
      .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, userId)))
      .returning();

    return updated;
  }

  static async addDeposit(userId: string, id: string, amount: number) {
    if (!amount || amount <= 0) throw new ValidationError('Nominal setoran harus lebih dari 0');
    const existing = await this.getById(userId, id);
    const newTerkumpul = existing.terkumpulNominal + amount;

    const [updated] = await db
      .update(savingGoals)
      .set({
        terkumpulNominal: newTerkumpul,
        isCompleted: newTerkumpul >= existing.targetNominal,
      })
      .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, userId)))
      .returning();

    return updated;
  }

  static async delete(userId: string, id: string) {
    await this.getById(userId, id);
    await db
      .delete(savingGoals)
      .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, userId)));
    return { success: true };
  }
}
