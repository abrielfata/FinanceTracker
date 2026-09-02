import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as AuthService from '../services/auth.service';

const router = Router();

// Rate limiting for auth routes (max 10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Terlalu banyak percobaan, silakan coba lagi setelah 15 menit' },
});

const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const updateProfileSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
});

router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const { nama, email, password } = parsed.data;
    const { newUser, tokens } = await AuthService.registerUser({ nama, email, passwordHash: password });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: newUser,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const { email, password } = parsed.data;
    const { user, tokens } = await AuthService.loginUser(email, password);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login berhasil',
      user,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', (req: Request, res: Response, next: NextFunction): void => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token tidak ditemukan' });
    return;
  }

  try {
    const tokens = AuthService.refreshAccessToken(refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logout berhasil' });
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const updatedUser = await AuthService.updateProfile(req.user!.id, parsed.data.nama);
    res.json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (err) {
    next(err);
  }
});

router.put('/password', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const parsed = updatePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    await AuthService.updatePassword(req.user!.id, parsed.data.oldPassword, parsed.data.newPassword);
    res.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
});

export default router;
