import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  siklusTgl: z.number().int().min(1, "Tanggal minimal 1").max(31, "Tanggal maksimal 31")
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nama, siklusTgl } = updateProfileSchema.parse(req.body);

    const [updatedUser] = await db
      .update(users)
      .set({
        nama,
        siklusTgl
      })
      .where(eq(users.id, req.user!.id))
      .returning({
        id: users.id,
        nama: users.nama,
        email: users.email,
        siklusTgl: users.siklusTgl
      });

    res.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

export default router;
