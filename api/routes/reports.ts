import { Router, Request, Response } from 'express';
import { ReportService } from '../services/report.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import type { Report, ApiResponse } from '../../shared/types.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Report[]>>) => {
    const filters: Record<string, string | number> = {};

    if (req.user?.role === 'employee') {
      filters.employeeId = req.user.id;
    } else if (req.user?.role === 'institution') {
      filters.institutionId = req.user.institutionId || '';
    }

    if (req.query.year) filters.year = parseInt(req.query.year as string, 10);

    const reports = ReportService.getAll(filters);
    res.json({ success: true, data: reports });
  }
);

router.get(
  '/:id',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Report>>) => {
    const report = ReportService.getById(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: '报告不存在' });
      return;
    }

    if (req.user?.role === 'employee' && report.employeeId !== req.user.id) {
      res.status(403).json({ success: false, error: '无权查看' });
      return;
    }
    if (req.user?.role === 'institution' && report.institutionId !== req.user.institutionId) {
      res.status(403).json({ success: false, error: '无权查看' });
      return;
    }
    if (req.user?.role === 'hr') {
      res.status(403).json({ success: false, error: 'HR无权查看个人报告详情，保护员工隐私' });
      return;
    }

    res.json({ success: true, data: report });
  }
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('institution'),
  (req: Request, res: Response<ApiResponse<Report>>) => {
    if (!req.user?.institutionId) {
      res.status(400).json({ success: false, error: '机构信息缺失' });
      return;
    }

    const reportData = {
      ...req.body,
      institutionId: req.user.institutionId,
    };

    const newReport = ReportService.create(reportData);
    res.status(201).json({ success: true, data: newReport });
  }
);

export default router;
