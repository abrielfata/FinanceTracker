import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as DashboardService from '../services/dashboard.service';

const router = Router();
router.use(authMiddleware);

// GET /api/dashboard/summary?bulan=9&tahun=2024
router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { bulan, tahun, startDate, endDate } = req.query;

  try {
    const bulanNum = bulan ? parseInt(bulan as string) : new Date().getMonth() + 1;
    const tahunNum = tahun ? parseInt(tahun as string) : new Date().getFullYear();

    // Default ke kalender normal jika tidak ada range
    const fallbackStart = new Date(tahunNum, bulanNum - 1, 1).toISOString().split('T')[0];
    const fallbackEnd = new Date(tahunNum, bulanNum, 0).toISOString().split('T')[0];

    const finalStartDate = (startDate as string) || fallbackStart;
    const finalEndDate = (endDate as string) || fallbackEnd;

    const data = await DashboardService.getDashboardSummary(req.user!.id, bulanNum, tahunNum, finalStartDate, finalEndDate);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trend
router.get('/trend', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { startDate, endDate } = req.query;
  try {
    const data = await DashboardService.getTrendSummary(req.user!.id, startDate as string, endDate as string);
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
