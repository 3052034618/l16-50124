import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import type { UserRole, LoginResponse } from '../../shared/types';

const roles: { key: UserRole; label: string; icon: typeof User }[] = [
  { key: 'employee', label: '员工', icon: User },
  { key: 'hr', label: 'HR管理员', icon: Building2 },
  { key: 'institution', label: '体检机构', icon: HeartHandshake },
];

const demoAccounts: Record<UserRole, { username: string; password: string }> = {
  employee: { username: 'zhangsan', password: '123456' },
  hr: { username: 'hr_admin', password: '123456' },
  institution: { username: 'meinian_admin', password: '123456' },
};

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [username, setUsername] = useState('zhangsan');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setUsername(demoAccounts[role].username);
    setPassword(demoAccounts[role].password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
        role: selectedRole,
      });

      if (result.success && result.data) {
        setAuth(result.data.user, result.data.token);
        if (selectedRole === 'hr') {
          navigate('/hr/dashboard');
        } else if (selectedRole === 'employee') {
          navigate('/employee/home');
        } else {
          navigate('/institution/home');
        }
      } else {
        setError(result.error || '登录失败');
      }
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-white max-w-md px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">健康体检管理系统</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">企业员工健康管理平台</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            统一预约管理、在线查看报告、历年健康数据对比、隐私保护下的健康统计分析，助力企业员工健康管理。
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">3种角色</div>
              <div className="text-white/70 text-sm mt-1">HR/员工/机构</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">历年对比</div>
              <div className="text-white/70 text-sm mt-1">健康趋势追踪</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">隐私保护</div>
              <div className="text-white/70 text-sm mt-1">HR仅看统计</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">健康体检管理系统</span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎登录</h2>
            <p className="text-gray-500 mb-6">请选择您的角色并登录系统</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.key;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleRoleChange(role.key)}
                    className={`flex flex-col items-center gap-2 py-3 px-2 rounded-lg border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">账号</label>
                <input
                  type="text"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号"
                />
              </div>

              <div>
                <label className="label">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-2.5 text-base"
              >
                {loading ? '登录中...' : '登 录'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">演示账号：</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>HR：hr_admin / 123456</p>
                <p>员工：zhangsan / 123456</p>
                <p>机构：meinian_admin / 123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
