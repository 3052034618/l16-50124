import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { api } from '../../services/api';
import type { Package as PackageType } from '../../../shared/types';

export default function HrPackages() {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    applicableGender: 'all' as 'all' | 'male' | 'female',
    status: 'active' as 'active' | 'inactive',
  });

  const fetchPackages = async () => {
    setLoading(true);
    const result = await api.get<PackageType[]>('/packages?includeInactive=true');
    if (result.success && result.data) {
      setPackages(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      applicableGender: 'all',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      originalPrice: pkg.originalPrice || 0,
      applicableGender: pkg.applicableGender,
      status: pkg.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个套餐吗？')) return;
    const result = await api.delete(`/packages/${id}`);
    if (result.success) {
      fetchPackages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackage) {
      const result = await api.put(`/packages/${editingPackage.id}`, formData);
      if (result.success) {
        setShowModal(false);
        fetchPackages();
      }
    } else {
      const result = await api.post('/packages', formData);
      if (result.success) {
        setShowModal(false);
        fetchPackages();
      }
    }
  };

  const statusText: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
  };

  const genderText: Record<string, string> = {
    all: '全部',
    male: '男性',
    female: '女性',
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="搜索套餐名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAdd} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" />
          新增套餐
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">套餐名称</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">适用人群</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目数</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPackages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{pkg.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{pkg.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-base font-semibold text-primary-600">¥{pkg.price}</div>
                  {pkg.originalPrice && (
                    <div className="text-xs text-gray-400 line-through">¥{pkg.originalPrice}</div>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{genderText[pkg.applicableGender]}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{pkg.items.length} 项</td>
                <td className="px-5 py-4">
                  <span className={`status-badge ${pkg.status === 'active' ? 'status-normal' : 'bg-gray-100 text-gray-500'}`}>
                    {statusText[pkg.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPackages.length === 0 && (
          <div className="py-12 text-center text-gray-400">暂无套餐数据</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingPackage ? '编辑套餐' : '新增套餐'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">套餐名称</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">套餐描述</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">售价 (元)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="label">原价 (元)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">适用人群</label>
                  <select
                    className="input"
                    value={formData.applicableGender}
                    onChange={(e) => setFormData({ ...formData, applicableGender: e.target.value as 'all' | 'male' | 'female' })}
                  >
                    <option value="all">全部</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                  </select>
                </div>
                <div>
                  <label className="label">状态</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">启用</option>
                    <option value="inactive">禁用</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
