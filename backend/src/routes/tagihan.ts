import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as TagihanService from '../services/tagihan.service';

const router = Router();
router.use(authMiddleware);

const tagihanSchema = z.object({
  nama: z.string().min(1, 'Nama tagihan wajib diisi'),
  nominal: z.number().positive('Nominal harus lebih dari 0'),
  tanggalJatuhTempo: z.number().min(1).max(31),
  kategori: z.string().default('Lainnya'),
  catatan: z.string().optional(),
  isBerulang: z.boolean().default(true),
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { bulan, tahun } = req.query;

  try {
    const data = await TagihanService.getTagihanList(
      req.user!.id,
      bulan as string | undefined,
      tahun as string | undefined
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = tagihanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const data = await TagihanService.createTagihan(req.user!.id, parsed.data);
    res.status(201).json({ message: 'Tagihan berhasil ditambahkan', data });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = tagihanSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const data = await TagihanService.updateTagihan(req.user!.id, req.params.id as string, parsed.data);
    res.json({ message: 'Tagihan berhasil diubah', data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await TagihanService.deleteTagihan(req.user!.id, req.params.id as string);
    res.json({ message: 'Tagihan berhasil dihapus' });
  } catch (err) {
    next(err);
  }
});

router.patch('/bulan/:id/bayar', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await TagihanService.payTagihan(req.user!.id, req.params.id as string);
    res.json({ message: 'Tagihan berhasil ditandai lunas', data });
  } catch (err) {
    next(err);
  }
});

router.patch('/bulan/:id/batal', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await TagihanService.cancelPayTagihan(req.user!.id, req.params.id as string);
    res.json({ message: 'Status tagihan berhasil dibatalkan', data });
  } catch (err) {
    next(err);
  }
});

export default router;
