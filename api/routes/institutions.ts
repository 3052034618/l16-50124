import { Router, Request, Response } from 'express';
import { InstitutionService } from '../services/institution.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import type { Institution, Store, ApiResponse } from '../../shared/types.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  (_req: Request, res: Response<ApiResponse<Institution[]>>) => {
    const institutions = InstitutionService.getAll(true);
    res.json({ success: true, data: institutions });
  }
);

router.get(
  '/:id',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Institution>>) => {
    const institution = InstitutionService.getById(req.params.id);
    if (!institution) {
      res.status(404).json({ success: false, error: '机构不存在' });
      return;
    }
    res.json({ success: true, data: institution });
  }
);

router.get(
  '/:id/stores',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Store[]>>) => {
    const stores = InstitutionService.getStores(req.params.id);
    res.json({ success: true, data: stores });
  }
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('hr'),
  (req: Request, res: Response<ApiResponse<Institution>>) => {
    const newInstitution = InstitutionService.create(req.body);
    res.status(201).json({ success: true, data: newInstitution });
  }
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('hr'),
  (req: Request, res: Response<ApiResponse<Institution>>) => {
    const updated = InstitutionService.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: '机构不存在' });
      return;
    }
    res.json({ success: true, data: updated });
  }
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('hr'),
  (req: Request, res: Response<ApiResponse>) => {
    const success = InstitutionService.remove(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: '机构不存在' });
      return;
    }
    res.json({ success: true, message: '删除成功' });
  }
);

export default router;
