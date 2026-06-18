import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Package, X, FileText } from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment } from '../../../shared/types';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const statusText: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

export default function EmployeeMyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAppointments = async () => {
    setLoading(true);
    let url = '/appointments';
    if (activeTab !== 'all') {
      url += `?status=${activeTab}`;
    }
    const result = await api.get<Appointment[]>(url);
    if (result.success && result.data) {
      setAppointments(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleCancel = async (id: string) => {
    if (!confirm('确定要取消这个预约吗？')) return;
    const result = await api.put(`/appointments/${id}/cancel`);
    if (result.success) {
      fetchAppointments();
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white p-1 rounded-lg inline-flex shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">暂无预约记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    apt.status === 'cancelled' ? 'bg-gray-100' :
                    apt.status === 'completed' ? 'bg-success-50' : 'bg-primary-50'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      apt.status === 'cancelled' ? 'text-gray-400' :
                      apt.status === 'completed' ? 'text-success-500' : 'text-primary-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{apt.packageName}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span>{apt.institutionName}</span>
                    </div>
                  </div>
                </div>
                <span className={`status-badge status-${apt.status}`}>
                  {statusText[apt.status]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{apt.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{apt.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{apt.storeName}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="btn btn-secondary text-danger-500 border-danger-200 hover:bg-danger-50 gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消预约
                  </button>
                )}
                {apt.status === 'completed' && apt.reportId && (
                  <button
                    onClick={() => window.location.href = `/employee/reports/${apt.reportId}`}
                    className="btn btn-primary gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    查看报告
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
