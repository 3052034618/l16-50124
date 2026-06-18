import { Request, Response, NextFunction } from 'express';
import { DataRepository } from '../data/repository.js';
import type { User, UserRole } from '../../shared/types.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const TOKEN_USER_MAP: Record<string, string> = {
  'token-hr-001': 'hr-001',
  'token-emp-001': 'emp-001',
  'token-emp-002': 'emp-002',
  'token-emp-003': 'emp-003',
  'token-emp-004': 'emp-004',
  'token-emp-005': 'emp-005',
  'token-emp-006': 'emp-006',
  'token-emp-007': 'emp-007',
  'token-emp-008': 'emp-008',
  'token-ins-001': 'ins-001',
  'token-ins-002': 'ins-002',
};

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未授权访问' });
    return;
  }

  const token = authHeader.slice(7);
  const userId = TOKEN_USER_MAP[token];

  if (!userId) {
    res.status(401).json({ success: false, error: '无效的token' });
    return;
  }

  const user = DataRepository.findUserById(userId);
  if (!user) {
    res.status(401).json({ success: false, error: '用户不存在' });
    return;
  }

  req.user = user;
  next();
}

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权访问' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: '权限不足' });
      return;
    }

    next();
  };
}

export function generateToken(userId: string): string {
  const existingEntry = Object.entries(TOKEN_USER_MAP).find(([_, uid]) => uid === userId);
  if (existingEntry) {
    return existingEntry[0];
  }
  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  TOKEN_USER_MAP[token] = userId;
  return token;
}
