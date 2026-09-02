import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as DashboardService from '../services/dashboard.service';

const router = Router();
router.use(authMiddleware);

// GET /api/dashboard/summary?bulan=9&tahun=2024
router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { bulan, tahun } = req.query;

  try {
    const bulanNum = bulan ? parseInt(bulan as string) : new Date().getMonth() + 1;
    const tahunNum = tahun ? parseInt(tahun as string) : new Date().getFullYear();

    const data = await DashboardService.getDashboardSummary(req.user!.id, bulanNum, tahunNum);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trend
router.get('/trend', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await DashboardService.getTrendSummary(req.user!.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/export
router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await DashboardService.getAllExportData(req.user!.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
