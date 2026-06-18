import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, User, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment } from '../../../shared/types';

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const statusText: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

export default function HrAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    let url = '/appointments';
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const result = await api.get<Appointment[]>(url);
    if (result.success && result.data) {
      setAppointments(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [status]);

  const filteredAppointments = appointments.filter(apt =>
    apt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="搜索员工/套餐..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="input w-36"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          共 <span className="font-medium text-gray-800">{filteredAppointments.length}</span> 条预约
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工信息</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">体检套餐</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">机构门店</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预约时间</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAppointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-4.5 h-4.5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{apt.employeeName}</div>
                      <div className="text-xs text-gray-400">{apt.employeeDepartment}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{apt.packageName}</td>
                <td className="px-5 py-4">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-700">{apt.institutionName}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {apt.storeName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {apt.appointmentDate} {apt.timeSlot}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`status-badge status-${apt.status}`}>
                    {statusText[apt.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && (
          <div className="py-12 text-center text-gray-400">暂无预约数据</div>
        )}
      </div>
    </div>
  );
}
