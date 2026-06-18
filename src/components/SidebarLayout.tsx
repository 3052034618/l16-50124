import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Building2,
  Calendar,
  BarChart3,
  Home,
  ClipboardList,
  FileText,
  Heart,
  LogOut,
  User,
  HeartHandshake,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import type { UserRole } from '../../shared/types';

interface MenuItem {
  key: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const roleMenus: Record<UserRole, MenuItem[]> = {
  hr: [
    { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard, path: '/hr/dashboard' },
    { key: 'packages', label: '套餐管理', icon: Package, path: '/hr/packages' },
    { key: 'institutions', label: '机构管理', icon: Building2, path: '/hr/institutions' },
    { key: 'appointments', label: '预约管理', icon: Calendar, path: '/hr/appointments' },
    { key: 'statistics', label: '健康统计', icon: BarChart3, path: '/hr/statistics' },
  ],
  employee: [
    { key: 'home', label: '首页', icon: Home, path: '/employee/home' },
    { key: 'appointment', label: '体检预约', icon: Calendar, path: '/employee/appointment' },
    { key: 'my-appointments', label: '我的预约', icon: ClipboardList, path: '/employee/my-appointments' },
    { key: 'reports', label: '体检报告', icon: FileText, path: '/employee/reports' },
    { key: 'health-archive', label: '健康档案', icon: Heart, path: '/employee/health-archive' },
  ],
  institution: [
    { key: 'home', label: '首页', icon: Home, path: '/institution/home' },
    { key: 'appointments', label: '预约管理', icon: Calendar, path: '/institution/appointments' },
    { key: 'report-upload', label: '报告上传', icon: Upload, path: '/institution/report-upload' },
  ],
};

const roleTitles: Record<UserRole, string> = {
  hr: 'HR管理后台',
  employee: '员工健康中心',
  institution: '体检机构端',
};

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuthStore();

  const menus = role ? roleMenus[role] : [];
  const title = role ? roleTitles[role] : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">{title}</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {menus.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.department || user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-lg font-semibold text-gray-800">
            {menus.find(m => location.pathname.startsWith(m.path))?.label || ''}
          </h1>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
