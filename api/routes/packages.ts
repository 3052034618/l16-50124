import { Router, Request, Response } from 'express';
import { PackageService } from '../services/package.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import type { Package, ApiResponse } from '../../shared/types.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Package[]>>) => {
    const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'hr';
    const packages = PackageService.getAllPackages(includeInactive);
    res.json({ success: true, data: packages });
  }
);

router.get(
  '/:id',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<Package>>) => {
    const pkg = PackageService.getPackageById(req.params.id);
    if (!pkg) {
      res.status(404).json({ success: false, error: '套餐不存在' });
      return;
    }
    res.json({ success: true, data: pkg });
  }
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('hr'),
  (req: Request, res: Response<ApiResponse<Package>>) => {
    const newPackage = PackageService.createPackage(req.body);
    res.status(201).json({ success: true, data: newPackage });
  }
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('hr'),
  (req: Request, res: Response<ApiResponse<Package>>) => {
    const updated = PackageService.updatePackage(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: '套餐不存在' });
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
    const success = PackageService.deletePackage(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: '套餐不存在' });
      return;
    }
    res.json({ success: true, message: '删除成功' });
  }
);

export default router;
