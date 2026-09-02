import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as NotificationService from '../services/notification.service';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await NotificationService.getDynamicNotifications(req.user!.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
