import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.js';
import type { LoginRequest, ApiResponse, LoginResponse, User } from '../../shared/types.js';

const router = Router();

router.post('/login', (req: Request, res: Response<ApiResponse<LoginResponse>>) => {
  const { username, password, role } = req.body as LoginRequest;

  if (!username || !password || !role) {
    res.status(400).json({
      success: false,
      error: '请提供用户名、密码和角色',
    });
    return;
  }

  const result = AuthService.login({ username, password, role });

  if (!result) {
    res.status(401).json({
      success: false,
      error: '用户名或密码错误',
    });
    return;
  }

  res.json({
    success: true,
    data: result,
  });
});

router.get(
  '/profile',
  authMiddleware,
  (req: Request, res: Response<ApiResponse<User>>) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权' });
      return;
    }

    res.json({
      success: true,
      data: req.user as User,
    });
  }
);

export default router;
