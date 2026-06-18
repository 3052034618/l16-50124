import { useState, useEffect } from 'react';
import { Calendar, FileText, Users, TrendingUp, Clock } from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, Report } from '../../../shared/types';

export default function InstitutionHome() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, repRes] = await Promise.all([
          api.get<Appointment[]>('/appointments'),
          api.get<Report[]>('/reports'),
        ]);

        if (aptRes.success && aptRes.data) {
          setAppointments(aptRes.data);
        }
        if (repRes.success && repRes.data) {
          setReports(repRes.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate === today && a.status !== 'cancelled');
  const pendingReports = appointments.filter(a => a.status === 'completed' && !a.reportId);

  const stats = [
    { label: '今日预约', value: todayAppointments.length, icon: Calendar, color: 'primary' },
    { label: '总预约数', value: appointments.length, icon: Users, color: 'success' },
    { label: '已出报告', value: reports.length, icon: FileText, color: 'warning' },
    { label: '待上传报告', value: pendingReports.length, icon: Clock, color: 'danger' },
  ];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = {
            primary: 'bg-primary-50 text-primary-600',
            success: 'bg-success-50 text-success-600',
            warning: 'bg-warning-50 text-warning-600',
            danger: 'bg-danger-50 text-danger-600',
          }[stat.color] || 'bg-primary-50 text-primary-600';

          return (
            <div key={index} className="card p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
            今日预约
          </h3>
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm">{apt.employeeName}</div>
                    <div className="text-xs text-gray-400">
                      {apt.packageName} · {apt.timeSlot}
                    </div>
                  </div>
                  <span className={`status-badge status-${apt.status} flex-shrink-0`}>
                    {apt.status === 'pending' ? '待确认' : apt.status === 'confirmed' ? '已确认' : '已完成'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">今日暂无预约</p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-warning-500" />
            待上传报告
          </h3>
          {pendingReports.length > 0 ? (
            <div className="space-y-3">
              {pendingReports.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-warning-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm">{apt.employeeName}</div>
                    <div className="text-xs text-gray-400">
                      {apt.packageName} · {apt.appointmentDate}
                    </div>
                  </div>
                  <button className="text-xs text-primary-500 hover:text-primary-600">
                    上传报告
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无待上传报告</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success-500" />
          最近体检数据概览
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-primary-50/50 rounded-xl text-center">
            <div className="text-2xl font-bold text-primary-600">{appointments.length}</div>
            <div className="text-sm text-gray-500 mt-1">总预约数</div>
          </div>
          <div className="p-4 bg-success-50/50 rounded-xl text-center">
            <div className="text-2xl font-bold text-success-600">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">已完成</div>
          </div>
          <div className="p-4 bg-warning-50/50 rounded-xl text-center">
            <div className="text-2xl font-bold text-warning-600">{reports.length}</div>
            <div className="text-sm text-gray-500 mt-1">已出报告</div>
          </div>
          <div className="p-4 bg-danger-50/50 rounded-xl text-center">
            <div className="text-2xl font-bold text-danger-600">
              {Math.round(reports.length > 0
                ? (reports.reduce((sum, r) => sum + r.indicators.filter(i => i.status !== 'normal').length, 0) / reports.length)
                : 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">平均异常项</div>
          </div>
        </div>
      </div>
    </div>
  );
}
