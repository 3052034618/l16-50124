import { useState, useEffect } from 'react';
import { Users, FileText, AlertTriangle, TrendingUp, Activity, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';
import type { ParticipationStats, AbnormalityStats } from '../../../shared/types';

const COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1'];

export default function HrDashboard() {
  const [participation, setParticipation] = useState<ParticipationStats | null>(null);
  const [abnormalities, setAbnormalities] = useState<AbnormalityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partRes, abnRes] = await Promise.all([
          api.get<ParticipationStats>('/statistics/participation'),
          api.get<AbnormalityStats>('/statistics/abnormalities'),
        ]);

        if (partRes.success && partRes.data) {
          setParticipation(partRes.data);
        }
        if (abnRes.success && abnRes.data) {
          setAbnormalities(abnRes.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: '员工总数', value: participation?.totalEmployees || 0, icon: Users, color: 'primary' },
    { label: '体检参与率', value: `${participation?.participationRate || 0}%`, icon: Activity, color: 'success' },
    { label: '体检报告数', value: abnormalities?.totalExamined || 0, icon: FileText, color: 'primary' },
    { label: '异常项数', value: abnormalities?.indicators.length || 0, icon: AlertTriangle, color: 'warning' },
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
          }[stat.color as keyof typeof colorClass] || 'bg-primary-50 text-primary-600';

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
          <h3 className="text-base font-semibold text-gray-800 mb-4">各部门参与率</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation?.byDepartment || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="department" width={80} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '参与率']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="rate" fill="#165DFF" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">异常指标分布 Top 5</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={abnormalities?.indicators.slice(0, 5) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="rate"
                  nameKey="name"
                >
                  {abnormalities?.indicators.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center -mt-2">
            {abnormalities?.indicators.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-600">{item.name} ({item.rate}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">异常指标检出率排行</h3>
          <span className="text-xs text-gray-400">共 {abnormalities?.indicators.length || 0} 项指标</span>
        </div>
        <div className="space-y-3">
          {abnormalities?.indicators.slice(0, 8).map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                item.rank <= 3 ? 'bg-danger-100 text-danger-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {item.rank}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">{item.rate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.rate > 30 ? 'bg-danger-500' : item.rate > 15 ? 'bg-warning-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min(item.rate * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">月度体检趋势</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#36CFC9" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">年龄段参与情况</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation?.byAgeGroup || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ageGroup" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="participated" name="已参与" fill="#165DFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="总人数" fill="#E8F3FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
