import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as BudgetService from '../services/budget.service';

const router = Router();
router.use(authMiddleware);

const budgetSchema = z.object({
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  nominal: z.number().positive('Nominal harus lebih dari 0'),
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2020).max(2100),
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { bulan, tahun } = req.query;

  try {
    const bulanNum = bulan ? parseInt(bulan as string) : new Date().getMonth() + 1;
    const tahunNum = tahun ? parseInt(tahun as string) : new Date().getFullYear();

    const data = await BudgetService.getBudgetList(req.user!.id, bulanNum, tahunNum);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = budgetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const data = await BudgetService.createOrUpdateBudget(req.user!.id, parsed.data);
    res.status(201).json({ message: 'Budget berhasil disimpan', data });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = z.object({ nominal: z.number().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Nominal tidak valid' });
    return;
  }

  try {
    const data = await BudgetService.updateBudgetNominal(req.user!.id, req.params.id as string, parsed.data.nominal);
    res.json({ message: 'Budget berhasil diubah', data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await BudgetService.deleteBudget(req.user!.id, req.params.id as string);
    res.json({ message: 'Budget berhasil dihapus' });
  } catch (err) {
    next(err);
  }
});

export default router;
