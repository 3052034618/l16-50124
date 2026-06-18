import { Router, Request, Response } from 'express';
import { HealthArchiveService } from '../services/health-archive.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import type { HealthArchive, TrendData, ApiResponse } from '../../shared/types.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware('employee'),
  (req: Request, res: Response<ApiResponse<HealthArchive>>) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权' });
      return;
    }

    const archive = HealthArchiveService.getArchive(req.user.id);
    if (!archive) {
      res.status(404).json({ success: false, error: '健康档案不存在' });
      return;
    }

    res.json({ success: true, data: archive });
  }
);

router.get(
  '/trend',
  authMiddleware,
  roleMiddleware('employee'),
  (req: Request, res: Response<ApiResponse<TrendData>>) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权' });
      return;
    }

    const indicatorName = req.query.indicator as string;
    if (!indicatorName) {
      res.status(400).json({ success: false, error: '请提供指标名称' });
      return;
    }

    const trendData = HealthArchiveService.getTrendData(req.user.id, indicatorName);
    if (!trendData) {
      res.status(404).json({ success: false, error: '未找到该指标数据' });
      return;
    }

    res.json({ success: true, data: trendData });
  }
);

router.get(
  '/indicators',
  authMiddleware,
  roleMiddleware('employee'),
  (req: Request, res: Response<ApiResponse<string[]>>) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权' });
      return;
    }

    const indicators = HealthArchiveService.getAvailableIndicators(req.user.id);
    res.json({ success: true, data: indicators });
  }
);

export default router;
