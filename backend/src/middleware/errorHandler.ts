import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error('❌ Server Error:', err);
  res.status(500).json({
    message: 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};
