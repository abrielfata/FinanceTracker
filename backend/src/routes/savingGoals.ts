import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { SavingGoalService } from '../services/savingGoal.service';

const router = Router();
router.use(authMiddleware);

const goalSchema = z.object({
  nama: z.string().min(1, 'Nama target tabungan wajib diisi'),
  targetNominal: z.number().positive('Target nominal harus lebih dari 0'),
  terkumpulNominal: z.number().nonnegative().optional().default(0),
  targetBulan: z.string().optional(),
  kategori: z.string().optional().default('Tabungan'),
  warna: z.string().optional().default('#2B6CB0'),
  ikon: z.string().optional().default('savings'),
  catatan: z.string().optional(),
});

// GET /api/saving-goals
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goals = await SavingGoalService.getAll(req.user!.id);
    res.json({ data: goals });
  } catch (err) {
    next(err);
  }
});

// GET /api/saving-goals/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const goal = await SavingGoalService.getById(req.user!.id, id);
    res.json({ data: goal });
  } catch (err) {
    next(err);
  }
});

// POST /api/saving-goals
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const goal = await SavingGoalService.create(req.user!.id, parsed.data);
    res.status(201).json({ message: 'Target tabungan berhasil dibuat', data: goal });
  } catch (err) {
    next(err);
  }
});

// PUT /api/saving-goals/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const goal = await SavingGoalService.update(req.user!.id, id, req.body);
    res.json({ message: 'Target tabungan berhasil diperbarui', data: goal });
  } catch (err) {
    next(err);
  }
});

// POST /api/saving-goals/:id/deposit
router.post('/:id/deposit', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { nominal } = req.body;
  if (!nominal || Number(nominal) <= 0) {
    res.status(400).json({ message: 'Nominal setoran harus lebih besar dari 0' });
    return;
  }

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const goal = await SavingGoalService.addDeposit(req.user!.id, id, Number(nominal));
    res.json({ message: 'Setoran tabungan berhasil dicatat', data: goal });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/saving-goals/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await SavingGoalService.delete(req.user!.id, id);
    res.json({ message: 'Target tabungan berhasil dihapus' });
  } catch (err) {
    next(err);
  }
});

export default router;
