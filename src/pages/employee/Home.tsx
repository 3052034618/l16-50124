import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Heart, AlertTriangle, ChevronRight, ClipboardList, Bell } from 'lucide-react';
import { api } from '../../services/api';
import type { Report, Appointment } from '../../../shared/types';

export default function EmployeeHome() {
  const navigate = useNavigate();
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, aptsRes] = await Promise.all([
          api.get<Report[]>('/reports'),
          api.get<Appointment[]>('/appointments'),
        ]);

        if (reportsRes.success && reportsRes.data && reportsRes.data.length > 0) {
          setLatestReport(reportsRes.data[0]);
        }
        if (aptsRes.success && aptsRes.data) {
          setAppointments(aptsRes.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  const quickActions = [
    { label: '体检预约', icon: Calendar, path: '/employee/appointment', color: 'primary' },
    { label: '我的预约', icon: ClipboardList, path: '/employee/my-appointments', color: 'success' },
    { label: '体检报告', icon: FileText, path: '/employee/reports', color: 'warning' },
    { label: '健康档案', icon: Heart, path: '/employee/health-archive', color: 'danger' },
  ];

  const abnormalCount = latestReport?.indicators.filter(i => i.status !== 'normal').length || 0;

  const statusText: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">您好，祝您身体健康！</h2>
          <p className="text-white/80 text-sm mb-5">关爱健康，定期体检</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/15 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">{pendingAppointments.length}</div>
              <div className="text-sm text-white/80">待体检</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">{completedCount}</div>
              <div className="text-sm text-white/80">已体检</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">{abnormalCount}</div>
              <div className="text-sm text-white/80">异常项</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const colorClass = {
            primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
            success: 'bg-success-50 text-success-600 hover:bg-success-100',
            warning: 'bg-warning-50 text-warning-600 hover:bg-warning-100',
            danger: 'bg-danger-50 text-danger-600 hover:bg-danger-100',
          }[action.color] || 'bg-primary-50 text-primary-600';

          const iconBgClass = {
            primary: 'bg-primary-100',
            success: 'bg-success-100',
            warning: 'bg-warning-100',
            danger: 'bg-danger-100',
          }[action.color] || 'bg-primary-100';

          return (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`card p-5 card-hover text-left transition-all duration-200 ${colorClass}`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 opacity-60" />
              </div>
              <div className="mt-4 font-semibold text-base">{action.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              待办提醒
            </h3>
            <button
              onClick={() => navigate('/employee/my-appointments')}
              className="text-xs text-primary-500 hover:text-primary-600"
            >
              查看全部
            </button>
          </div>

          {pendingAppointments.length > 0 ? (
            <div className="space-y-3">
              {pendingAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm">{apt.packageName}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <span>{apt.appointmentDate}</span>
                      <span>·</span>
                      <span>{apt.storeName}</span>
                    </div>
                  </div>
                  <span className={`status-badge status-${apt.status} flex-shrink-0`}>
                    {statusText[apt.status]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无待办事项</p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-success-500" />
              最新体检报告
            </h3>
            <button
              onClick={() => navigate('/employee/reports')}
              className="text-xs text-primary-500 hover:text-primary-600"
            >
              查看全部
            </button>
          </div>

          {latestReport ? (
            <div
              onClick={() => navigate(`/employee/reports/${latestReport.id}`)}
              className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">{latestReport.packageName}</span>
                <span className={`status-badge status-${latestReport.overallStatus}`}>
                  {latestReport.overallStatus === 'normal' ? '全部正常' :
                   latestReport.overallStatus === 'attention' ? '需关注' : '异常'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-3">{latestReport.examDate}</div>
              <p className="text-sm text-gray-600 line-clamp-2">{latestReport.summary}</p>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1.5">
                  {latestReport.overallStatus === 'abnormal' ? (
                    <AlertTriangle className="w-4 h-4 text-danger-500" />
                  ) : latestReport.overallStatus === 'attention' ? (
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                  ) : (
                    <Heart className="w-4 h-4 text-success-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {abnormalCount} 项异常
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {latestReport.indicators.length} 项指标
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无体检报告</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
