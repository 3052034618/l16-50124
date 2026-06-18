import { DataRepository } from '../data/repository.js';
import { generateToken } from '../middleware/auth.js';
import type { LoginRequest, LoginResponse, User } from '../../shared/types.js';

export const AuthService = {
  login(request: LoginRequest): LoginResponse | null {
    const user = DataRepository.findUserByUsername(request.username);

    if (!user || user.role !== request.role) {
      return null;
    }

    const token = generateToken(user.id);

    return {
      token,
      user: user as User,
    };
  },

  getProfile(userId: string): User | null {
    const user = DataRepository.findUserById(userId);
    return user ? (user as User) : null;
  },
};
