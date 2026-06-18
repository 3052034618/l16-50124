import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ChevronLeft, AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Minus, Calendar, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import type { Report, ReportIndicator } from '../../../shared/types';

const statusIcon = {
  normal: CheckCircle,
  low: TrendingDown,
  high: TrendingUp,
  abnormal: AlertTriangle,
};

const statusColors: Record<string, string> = {
  normal: 'text-success-500',
  low: 'text-primary-500',
  high: 'text-danger-500',
  abnormal: 'text-danger-500',
};

const statusBgColors: Record<string, string> = {
  normal: '',
  low: 'bg-primary-50',
  high: 'bg-danger-50',
  abnormal: 'bg-danger-50',
};

export default function EmployeeReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const result = await api.get<Report[]>('/reports');
      if (result.success && result.data) {
        setReports(result.data);
        if (result.data.length > 0 && !id) {
          setSelectedReport(result.data[0]);
        } else if (id) {
          const report = result.data.find(r => r.id === id);
          if (report) setSelectedReport(report);
        }
      }
      setLoading(false);
    };

    fetchReports();
  }, [id]);

  useEffect(() => {
    if (selectedReport) {
      const categories = [...new Set(selectedReport.indicators.map(i => i.category))];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [selectedReport]);

  const categories = selectedReport
    ? [...new Set(selectedReport.indicators.map(i => i.category))]
    : [];

  const filteredIndicators = selectedReport && selectedCategory
    ? selectedReport.indicators.filter(i => i.category === selectedCategory)
    : selectedReport?.indicators || [];

  const abnormalCount = selectedReport?.indicators.filter(i => i.status !== 'normal').length || 0;

  const overallStatusText = {
    normal: '体检结果良好',
    attention: '有需要关注的项目',
    abnormal: '存在异常项目',
  };

  const StatusBadge = ({ indicator }: { indicator: ReportIndicator }) => {
    const Icon = statusIcon[indicator.status] || Minus;
    const colorClass = statusColors[indicator.status] || 'text-gray-500';

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs">
          {indicator.status === 'normal' ? '正常' :
           indicator.status === 'low' ? '偏低' :
           indicator.status === 'high' ? '偏高' : '异常'}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      <div className="w-72 flex-shrink-0">
        <div className="card h-full overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              体检报告
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  navigate(`/employee/reports/${report.id}`);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedReport?.id === report.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="font-medium text-gray-800 text-sm">{report.packageName}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {report.examDate}
                  </span>
                  <span className={`status-badge status-${report.overallStatus} text-xs`}>
                    {report.overallStatus === 'normal' ? '正常' :
                     report.overallStatus === 'attention' ? '关注' : '异常'}
                  </span>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无报告
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedReport ? (
          <div className="space-y-4">
            {id && (
              <button
                onClick={() => navigate('/employee/reports')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                返回列表
              </button>
            )}

            <div className={`card p-6 ${
              selectedReport.overallStatus === 'abnormal' ? 'border-l-4 border-l-danger-500' :
              selectedReport.overallStatus === 'attention' ? 'border-l-4 border-l-warning-500' :
              'border-l-4 border-l-success-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedReport.packageName}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      体检日期：{selectedReport.examDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {selectedReport.institutionName}
                    </span>
                  </div>
                </div>
                <div className={`status-badge text-sm px-3 py-1 ${
                  selectedReport.overallStatus === 'normal' ? 'status-normal' :
                  selectedReport.overallStatus === 'attention' ? 'status-attention' :
                  'status-abnormal'
                }`}>
                  {overallStatusText[selectedReport.overallStatus]}
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-700">体检总结：</span>
                  {selectedReport.summary}
                </p>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{selectedReport.indicators.length}</div>
                  <div className="text-xs text-gray-400 mt-1">检查项目</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-500">{abnormalCount}</div>
                  <div className="text-xs text-gray-400 mt-1">异常项</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-500">
                    {selectedReport.indicators.length - abnormalCount}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">正常项</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {cat}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({selectedReport.indicators.filter(i => i.category === cat).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">指标名称</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">检测值</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">参考范围</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">状态</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredIndicators.map((indicator) => (
                    <tr
                      key={indicator.id}
                      className={`transition-colors ${statusBgColors[indicator.status]}`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-800">{indicator.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${
                          indicator.status === 'normal' ? 'text-gray-800' :
                          indicator.status === 'low' ? 'text-primary-600' :
                          'text-danger-600'
                        }`}>
                          {indicator.value}
                          <span className="text-xs font-normal text-gray-400 ml-1">{indicator.unit}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {indicator.referenceRange}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge indicator={indicator} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {indicator.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p>请选择一份报告查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
