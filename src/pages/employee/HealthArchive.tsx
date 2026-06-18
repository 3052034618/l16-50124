import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Activity, FileText, ChevronDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { api } from '../../services/api';
import type { HealthArchive, TrendData, ReportIndicator } from '../../../shared/types';

export default function EmployeeHealthArchive() {
  const [archive, setArchive] = useState<HealthArchive | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [showIndicatorSelect, setShowIndicatorSelect] = useState(false);
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const [archiveRes, indicatorsRes] = await Promise.all([
          api.get<HealthArchive>('/health-archive'),
          api.get<string[]>('/health-archive/indicators'),
        ]);

        if (archiveRes.success && archiveRes.data) {
          setArchive(archiveRes.data);
        }
        if (indicatorsRes.success && indicatorsRes.data) {
          setAvailableIndicators(indicatorsRes.data);
          if (indicatorsRes.data.length > 0 && !selectedIndicator) {
            setSelectedIndicator(indicatorsRes.data[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, []);

  useEffect(() => {
    if (!selectedIndicator) return;

    const fetchTrend = async () => {
      const result = await api.get<TrendData>(`/health-archive/trend?indicator=${encodeURIComponent(selectedIndicator)}`);
      if (result.success && result.data) {
        setTrendData(result.data);
      }
    };

    fetchTrend();
  }, [selectedIndicator]);

  const handleIndicatorSelect = (indicator: string) => {
    setSelectedIndicator(indicator);
    setShowIndicatorSelect(false);
  };

  const parseReferenceRange = (range: string): { min?: number; max?: number } => {
    const match = range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (match) {
      return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
    }
    return {};
  };

  const chartData = trendData?.dataPoints.map((dp) => ({
    year: dp.year,
    value: dp.value,
    status: dp.status,
  })) || [];

  const refRange = trendData ? parseReferenceRange(trendData.referenceRange) : {};

  const getStatusColor = (status: ReportIndicator['status']) => {
    switch (status) {
      case 'normal': return '#00B42A';
      case 'low': return '#165DFF';
      case 'high': return '#F53F3F';
      case 'abnormal': return '#F53F3F';
      default: return '#4E5969';
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{archive?.years.length || 0}</p>
              <p className="text-xs text-gray-500">建档年数</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{archive?.yearlyReports.length || 0}</p>
              <p className="text-xs text-gray-500">体检报告</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{availableIndicators.length}</p>
              <p className="text-xs text-gray-500">健康指标</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {trendData?.dataPoints.filter(d => d.status !== 'normal').length || 0}
              </p>
              <p className="text-xs text-gray-500">异常记录</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-800">指标趋势对比</h3>

          <div className="relative">
            <button
              onClick={() => setShowIndicatorSelect(!showIndicatorSelect)}
              className="btn btn-secondary gap-2 min-w-48 justify-between"
            >
              <span>{selectedIndicator || '选择指标'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showIndicatorSelect && (
              <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {availableIndicators.map((indicator) => (
                  <button
                    key={indicator}
                    onClick={() => handleIndicatorSelect(indicator)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedIndicator === indicator ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                    }`}
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {trendData && chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis
                  fontSize={12}
                  label={{ value: trendData.unit, angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#86909C' } }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, _name: string, props: { payload: { status: string } }) => [
                    <span style={{ color: getStatusColor(props.payload.status as ReportIndicator['status']) }}>
                      {value} {trendData.unit}
                    </span>,
                    selectedIndicator,
                  ]}
                />
                <Legend />

                {refRange.min !== undefined && (
                  <ReferenceLine y={refRange.min} stroke="#165DFF" strokeDasharray="3 3" label={{ value: '下限', position: 'right', fontSize: 10, fill: '#165DFF' }} />
                )}
                {refRange.max !== undefined && (
                  <ReferenceLine y={refRange.max} stroke="#F53F3F" strokeDasharray="3 3" label={{ value: '上限', position: 'right', fontSize: 10, fill: '#F53F3F' }} />
                )}

                <Line
                  type="monotone"
                  dataKey="value"
                  name={selectedIndicator}
                  stroke="#165DFF"
                  strokeWidth={2.5}
                  dot={(props: { cx: number; cy: number; payload: { status: string } }) => (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill={getStatusColor(props.payload.status as ReportIndicator['status'])}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500"></div>
                <span className="text-gray-600">正常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                <span className="text-gray-600">偏低</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger-500"></div>
                <span className="text-gray-600">偏高/异常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">
                  参考范围：{trendData.referenceRange}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            暂无该指标的趋势数据
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">历年数据汇总</h3>

        <div className="space-y-3">
          {archive?.yearlyReports.map((yearReport) => {
            const abnormalCount = yearReport.indicators.filter(i => i.status !== 'normal').length;
            const isExpanded = expandedYear === yearReport.year;

            return (
              <div
                key={yearReport.year}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedYear(isExpanded ? null : yearReport.year)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600">{yearReport.year}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">{yearReport.year} 年度体检</div>
                      <div className="text-sm text-gray-500">体检日期：{yearReport.examDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{yearReport.indicators.length} 项</div>
                      <div className="text-xs text-gray-400">检查指标</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${abnormalCount > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                        {abnormalCount} 项
                      </div>
                      <div className="text-xs text-gray-400">异常项</div>
                    </div>
                    <div className={`status-badge status-${yearReport.overallStatus}`}>
                      {yearReport.overallStatus === 'normal' ? '正常' :
                       yearReport.overallStatus === 'attention' ? '关注' : '异常'}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-4 gap-3">
                      {yearReport.indicators.slice(0, 8).map((indicator) => (
                        <div
                          key={indicator.id}
                          className={`p-3 rounded-lg ${
                            indicator.status === 'normal' ? 'bg-white' :
                            indicator.status === 'low' ? 'bg-primary-50' :
                            'bg-danger-50'
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">{indicator.name}</div>
                          <div className={`font-semibold ${
                            indicator.status === 'normal' ? 'text-gray-800' :
                            indicator.status === 'low' ? 'text-primary-600' :
                            'text-danger-600'
                          }`}>
                            {indicator.value} <span className="text-xs font-normal text-gray-400">{indicator.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {yearReport.indicators.length > 8 && (
                      <button className="text-sm text-primary-500 mt-3 hover:text-primary-600">
                        查看全部 {yearReport.indicators.length} 项指标
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
