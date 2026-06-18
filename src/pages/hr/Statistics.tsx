import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Users, Activity } from 'lucide-react';
import { api } from '../../services/api';
import type { ParticipationStats, AbnormalityStats } from '../../../shared/types';

export default function HrStatistics() {
  const [participation, setParticipation] = useState<ParticipationStats | null>(null);
  const [abnormalities, setAbnormalities] = useState<AbnormalityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'participation' | 'abnormality'>('abnormality');

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

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  const yoyIndicators = [...new Set(abnormalities?.yearOverYear.map(d => d.indicator) || [])];
  const yoyData = yoyIndicators.map(indicator => {
    const item: Record<string, string | number> = { indicator };
    abnormalities?.yearOverYear
      .filter(d => d.indicator === indicator)
      .forEach(d => {
        item[d.year] = d.rate;
      });
    return item;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('abnormality')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'abnormality'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            异常指标统计
          </div>
        </button>
        <button
          onClick={() => setActiveTab('participation')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'participation'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            参与率统计
          </div>
        </button>
      </div>

      {activeTab === 'abnormality' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{abnormalities?.indicators.length}</p>
                  <p className="text-xs text-gray-500">异常指标项数</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{abnormalities?.totalExamined}</p>
                  <p className="text-xs text-gray-500">体检人数</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {abnormalities?.indicators[0]?.rate || 0}%
                  </p>
                  <p className="text-xs text-gray-500">最高异常率</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-success-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {((abnormalities?.indicators.filter(i => i.rate < 10).length || 0) / (abnormalities?.indicators.length || 1) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">指标正常率</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">各指标异常检出率</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={abnormalities?.indicators.slice(0, 10) || []}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" unit="%" />
                    <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, '异常率']}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="rate" fill="#F53F3F" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">历年趋势对比</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yoyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="indicator" fontSize={12} />
                    <YAxis unit="%" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="2024" stroke="#165DFF" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="2025" stroke="#00B42A" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="2026" stroke="#F53F3F" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">各部门主要异常指标对比</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={abnormalities?.byDepartment.filter((_, i) => i < 20) || []}
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="department" fontSize={12} />
                  <YAxis unit="%" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="rate" name="异常率" fill="#FF7D00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'participation' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-6">
              <p className="text-sm text-gray-500 mb-2">员工总数</p>
              <p className="text-3xl font-bold text-gray-800">{participation?.totalEmployees}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-500 mb-2">已参与体检</p>
              <p className="text-3xl font-bold text-success-600">{participation?.participatedCount}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-500 mb-2">整体参与率</p>
              <p className="text-3xl font-bold text-primary-600">{participation?.participationRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">各部门参与率</h3>
              <div className="h-72">
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
              <h3 className="text-base font-semibold text-gray-800 mb-4">年龄段参与率</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participation?.byAgeGroup || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="ageGroup" fontSize={12} />
                    <YAxis domain={[0, 100]} unit="%" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="rate" name="参与率" fill="#00B42A" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">月度体检人数趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={participation?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="体检人数"
                    stroke="#165DFF"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#165DFF', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <div className="text-center text-xs text-gray-400 py-4">
        * HR仅可查看聚合统计数据，无法查阅员工个人报告，保护员工隐私
      </div>
    </div>
  );
}
