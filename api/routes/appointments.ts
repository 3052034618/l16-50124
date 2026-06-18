import { Router, Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import type { Appointment, ApiResponse } from '../../shared/types.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Appointment[]>>) => {
    const filters: Record<string, string> = {};

    if (req.user?.role === 'employee') {
      filters.employeeId = req.user.id;
    } else if (req.user?.role === 'institution') {
      filters.institutionId = req.user.institutionId || '';
    }

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
    if (req.query.institutionId) filters.institutionId = req.query.institutionId as string;
    if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom as string;
    if (req.query.dateTo) filters.dateTo = req.query.dateTo as string;

    const appointments = AppointmentService.getAll(filters);
    res.json({ success: true, data: appointments });
  }
);

router.get(
  '/:id',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Appointment>>) => {
    const appointment = AppointmentService.getById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, error: '预约不存在' });
      return;
    }

    if (req.user?.role === 'employee' && appointment.employeeId !== req.user.id) {
      res.status(403).json({ success: false, error: '无权查看' });
      return;
    }
    if (req.user?.role === 'institution' && appointment.institutionId !== req.user.institutionId) {
      res.status(403).json({ success: false, error: '无权查看' });
      return;
    }

    res.json({ success: true, data: appointment });
  }
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('employee'),
  (req: Request, res: Response<ApiResponse<Appointment>>) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权' });
      return;
    }

    const appointmentData = {
      ...req.body,
      employeeId: req.user.id,
      employeeName: req.user.name,
      employeeDepartment: req.user.department || '',
    };

    const newAppointment = AppointmentService.create(appointmentData);
    res.status(201).json({ success: true, data: newAppointment });
  }
);

router.put(
  '/:id/cancel',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Appointment>>) => {
    const appointment = AppointmentService.getById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, error: '预约不存在' });
      return;
    }

    if (req.user?.role === 'employee' && appointment.employeeId !== req.user.id) {
      res.status(403).json({ success: false, error: '无权操作' });
      return;
    }

    const cancelled = AppointmentService.cancel(req.params.id);
    if (!cancelled) {
      res.status(400).json({ success: false, error: '取消失败' });
      return;
    }
    res.json({ success: true, data: cancelled });
  }
);

export default router;
