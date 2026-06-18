import { create } from 'zustand';
import type { User, UserRole } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const getInitialState = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') as UserRole | null;
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    user,
    token,
    role,
    isAuthenticated: !!token && !!user,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, role: user.role, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    set({ user: null, token: null, role: null, isAuthenticated: false });
  },
}));
