import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as TransaksiService from '../services/transaksi.service';

const router = Router();
router.use(authMiddleware);

const transaksiSchema = z.object({
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  nominal: z.number().positive('Nominal harus lebih dari 0'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  deskripsi: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await TransaksiService.getTransaksiList(req.user!.id, req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = transaksiSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const data = await TransaksiService.createTransaksi({ ...parsed.data, userId: req.user!.id });
    res.status(201).json({ message: 'Transaksi berhasil ditambahkan', data });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = transaksiSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const data = await TransaksiService.updateTransaksi(req.user!.id, req.params.id as string, parsed.data);
    res.json({ message: 'Transaksi berhasil diubah', data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await TransaksiService.deleteTransaksi(req.user!.id, req.params.id as string);
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    next(err);
  }
});

export default router;
