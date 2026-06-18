import { useState, useEffect } from 'react';
import { Upload, FileText, Search, Plus } from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, Report } from '../../../shared/types';

export default function InstitutionReportUpload() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    examDate: '',
    overallStatus: 'normal' as 'normal' | 'attention' | 'abnormal',
    summary: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, repRes] = await Promise.all([
          api.get<Appointment[]>('/appointments?status=completed'),
          api.get<Report[]>('/reports'),
        ]);

        if (aptRes.success && aptRes.data) {
          const withoutReport = aptRes.data.filter(a => !a.reportId);
          setAppointments(withoutReport);
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

  const filteredAppointments = appointments.filter(apt =>
    apt.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedApt(apt);
    setFormData({
      examDate: apt.appointmentDate,
      overallStatus: 'normal',
      summary: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('报告上传功能演示中...');
    setSelectedApt(null);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      <div className="w-80 flex-shrink-0">
        <div className="card h-full overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">待上传报告预约</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input pl-9 text-sm"
                placeholder="搜索员工..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-2">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => handleSelectAppointment(apt)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedApt?.id === apt.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-800 text-sm">{apt.employeeName}</div>
                    <div className="text-xs text-gray-500 mt-1">{apt.packageName}</div>
                    <div className="text-xs text-gray-400 mt-1">{apt.appointmentDate}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无待上传报告的预约
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedApt ? (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-500" />
              上传体检报告
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-700 mb-2">预约信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">员工姓名：</span>
                  <span className="text-gray-800">{selectedApt.employeeName}</span>
                </div>
                <div>
                  <span className="text-gray-500">所属部门：</span>
                  <span className="text-gray-800">{selectedApt.employeeDepartment}</span>
                </div>
                <div>
                  <span className="text-gray-500">体检套餐：</span>
                  <span className="text-gray-800">{selectedApt.packageName}</span>
                </div>
                <div>
                  <span className="text-gray-500">体检门店：</span>
                  <span className="text-gray-800">{selectedApt.storeName}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">体检日期</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">整体状态</label>
                  <select
                    className="input"
                    value={formData.overallStatus}
                    onChange={(e) => setFormData({ ...formData, overallStatus: e.target.value as 'normal' | 'attention' | 'abnormal' })}
                  >
                    <option value="normal">全部正常</option>
                    <option value="attention">需关注</option>
                    <option value="abnormal">有异常</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">体检总结</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="请输入体检总结意见..."
                />
              </div>

              <div>
                <label className="label">上传报告PDF</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-gray-400 mt-1">支持 PDF 格式，最大 10MB</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  体检指标
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  可手动录入各项指标数据（演示功能）
                </p>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 px-2">
                    <span>指标名称</span>
                    <span>检测值</span>
                    <span>参考范围</span>
                    <span>状态</span>
                  </div>
                  {[
                    { name: '身高', value: '175', ref: '-', status: 'normal' },
                    { name: '体重', value: '70', ref: '-', status: 'normal' },
                    { name: '收缩压', value: '120', ref: '90-140', status: 'normal' },
                  ].map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <input className="input text-xs" defaultValue={item.name} />
                      <input className="input text-xs" defaultValue={item.value} />
                      <input className="input text-xs" defaultValue={item.ref} />
                      <select className="input text-xs" defaultValue={item.status}>
                        <option value="normal">正常</option>
                        <option value="low">偏低</option>
                        <option value="high">偏高</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-sm text-primary-500 hover:text-primary-600 mt-2"
                >
                  + 添加指标
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedApt(null)}
                  className="btn btn-secondary px-6"
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary px-8">
                  提交报告
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p>请从左侧选择一个预约来上传报告</p>
            </div>
          </div>
        )}

        {!selectedApt && filteredReports.length > 0 && (
          <div className="card mt-4 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">已上传报告</h3>
            <div className="space-y-2">
              {filteredReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary-500" />
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{report.employeeName}</div>
                      <div className="text-xs text-gray-400">{report.examDate} · {report.packageName}</div>
                    </div>
                  </div>
                  <span className={`status-badge status-${report.overallStatus}`}>
                    {report.overallStatus === 'normal' ? '正常' :
                     report.overallStatus === 'attention' ? '关注' : '异常'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
