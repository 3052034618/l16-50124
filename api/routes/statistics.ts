import { Router, Request, Response } from 'express';
import { StatisticsService } from '../services/statistics.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import type { ParticipationStats, AbnormalityStats, ApiResponse } from '../../shared/types.js';

const router = Router();

router.get(
  '/participation',
  authMiddleware,
  roleMiddleware('hr'),
  (_req: Request, res: Response<ApiResponse<ParticipationStats>>) => {
    const stats = StatisticsService.getParticipationStats();
    res.json({ success: true, data: stats });
  }
);

router.get(
  '/abnormalities',
  authMiddleware,
  roleMiddleware('hr'),
  (_req: Request, res: Response<ApiResponse<AbnormalityStats>>) => {
    const stats = StatisticsService.getAbnormalityStats();
    res.json({ success: true, data: stats });
  }
);

export default router;
