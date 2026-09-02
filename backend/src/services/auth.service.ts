import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, NewUser } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

export const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const registerUser = async (data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { nama, email, passwordHash: password } = data;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError('Email sudah terdaftar');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUser] = await db
    .insert(users)
    .values({ nama, email, passwordHash: hashedPassword })
    .returning({ id: users.id, email: users.email, nama: users.nama });

  const tokens = generateTokens(newUser.id, newUser.email);

  return { newUser, tokens };
};

export const loginUser = async (email: string, passwordString: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError('Email atau password salah');
  }

  const passwordMatch = await bcrypt.compare(passwordString, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Email atau password salah');
  }

  const tokens = generateTokens(user.id, user.email);

  return {
    user: { id: user.id, nama: user.nama, email: user.email },
    tokens,
  };
};

export const getMe = async (userId: string) => {
  const [user] = await db
    .select({ id: users.id, nama: users.nama, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('Pengguna tidak ditemukan');
  }

  return user;
};

export const refreshAccessToken = (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      email: string;
    };
    return generateTokens(decoded.id, decoded.email);
  } catch {
    throw new UnauthorizedError('Refresh token tidak valid');
  }
};

export const updateProfile = async (userId: string, nama: string) => {
  const [updatedUser] = await db
    .update(users)
    .set({ nama })
    .where(eq(users.id, userId))
    .returning({ id: users.id, nama: users.nama, email: users.email });

  if (!updatedUser) {
    throw new NotFoundError('Pengguna tidak ditemukan');
  }

  return updatedUser;
};

export const updatePassword = async (userId: string, oldPasswordString: string, newPasswordString: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('Pengguna tidak ditemukan');
  }

  const passwordMatch = await bcrypt.compare(oldPasswordString, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Password lama salah');
  }

  const hashedPassword = await bcrypt.hash(newPasswordString, 10);
  await db
    .update(users)
    .set({ passwordHash: hashedPassword })
    .where(eq(users.id, userId));
};
