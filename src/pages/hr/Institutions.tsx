import { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, Store as StoreIcon, Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { api } from '../../services/api';
import type { Institution, Store } from '../../../shared/types';

interface StoreFormItem {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  businessHours: string;
}

interface InstitutionFormData {
  name: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  stores: StoreFormItem[];
}

export default function HrInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<InstitutionFormData>({
    name: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    status: 'active',
    stores: [],
  });

  const fetchInstitutions = async () => {
    setLoading(true);
    const result = await api.get<Institution[]>('/institutions');
    if (result.success && result.data) {
      setInstitutions(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      status: 'active',
      stores: [
        { id: '1', name: '', address: '', district: '', phone: '', businessHours: '' }
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = (inst: Institution) => {
    setEditingId(inst.id);
    setFormData({
      name: inst.name,
      description: inst.description,
      contactPhone: inst.contactPhone,
      contactEmail: inst.contactEmail || '',
      status: inst.status,
      stores: inst.stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        district: s.district,
        phone: s.phone,
        businessHours: s.businessHours,
      })),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const addStore = () => {
    const newId = `store-${Date.now()}`;
    setFormData({
      ...formData,
      stores: [...formData.stores, { id: newId, name: '', address: '', district: '', phone: '', businessHours: '' }],
    });
  };

  const removeStore = (storeId: string) => {
    if (formData.stores.length <= 1) return;
    setFormData({
      ...formData,
      stores: formData.stores.filter(s => s.id !== storeId),
    });
  };

  const updateStore = (storeId: string, field: keyof StoreFormItem, value: string) => {
    setFormData({
      ...formData,
      stores: formData.stores.map(s =>
        s.id === storeId ? { ...s, [field]: value } : s
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const validStores = formData.stores.filter(s => s.name.trim() !== '').map((s, index) => ({
        id: s.id.startsWith('store-') ? `st-${Date.now()}-${index}` : s.id,
        name: s.name,
        address: s.address,
        district: s.district,
        phone: s.phone,
        businessHours: s.businessHours,
        dates: [],
      } as Store));

      const payload = {
        name: formData.name,
        description: formData.description,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        status: formData.status,
        stores: validStores,
      };

      let result;
      if (editingId) {
        result = await api.put<Institution>(`/institutions/${editingId}`, payload);
      } else {
        result = await api.post<Institution>('/institutions', payload);
      }

      if (result.success) {
        closeModal();
        await fetchInstitutions();
      } else {
        alert(`操作失败：${result.error || '未知错误'}`);
      }
    } catch (err) {
      alert('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除机构"${name}"吗？此操作不可恢复。`)) return;

    try {
      const result = await api.delete(`/institutions/${id}`);
      if (result.success) {
        await fetchInstitutions();
      } else {
        alert(`删除失败：${result.error || '未知错误'}`);
      }
    } catch (err) {
      alert('删除失败，请重试');
    }
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
            placeholder="搜索机构名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary gap-2" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          新增机构
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredInstitutions.map((inst) => (
          <div key={inst.id} className="card p-5 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{inst.name}</h3>
                  <span className={`status-badge ${inst.status === 'active' ? 'status-normal' : 'bg-gray-100 text-gray-500'}`}>
                    {inst.status === 'active' ? '合作中' : '已停用'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={() => openEditModal(inst)}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                  onClick={() => handleDelete(inst.id, inst.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{inst.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{inst.contactPhone}</span>
              </div>
              {inst.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{inst.contactEmail}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <StoreIcon className="w-4 h-4 text-gray-400" />
                <span>下属门店 ({inst.stores.length})</span>
              </div>
              <div className="space-y-2">
                {inst.stores.slice(0, 3).map((store) => (
                  <div key={store.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-700 truncate">{store.name}</div>
                      <div className="text-xs text-gray-400 truncate">{store.address}</div>
                    </div>
                  </div>
                ))}
                {inst.stores.length > 3 && (
                  <div className="text-xs text-gray-400 text-center pt-1">
                    还有 {inst.stores.length - 3} 个门店
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? '编辑机构' : '新增机构'}
              </h3>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="label">机构名称 *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入机构名称"
                    required
                  />
                </div>

                <div>
                  <label className="label">机构描述 *</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入机构描述"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">联系电话 *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="请输入联系电话"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">联系邮箱</label>
                    <input
                      type="email"
                      className="input"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="请输入联系邮箱"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">状态</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">合作中</option>
                    <option value="inactive">已停用</option>
                  </select>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="label m-0">门店信息</label>
                    <button
                      type="button"
                      onClick={addStore}
                      className="text-sm text-primary-500 hover:text-primary-600"
                    >
                      + 添加门店
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.stores.map((store, index) => (
                      <div key={store.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">门店 {index + 1}</span>
                          {formData.stores.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStore(store.id)}
                              className="text-gray-400 hover:text-danger-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">门店名称 *</label>
                            <input
                              type="text"
                              className="input text-sm mt-1"
                              value={store.name}
                              onChange={(e) => updateStore(store.id, 'name', e.target.value)}
                              placeholder="门店名称"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">所在区域</label>
                            <input
                              type="text"
                              className="input text-sm mt-1"
                              value={store.district}
                              onChange={(e) => updateStore(store.id, 'district', e.target.value)}
                              placeholder="如：朝阳区"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">详细地址</label>
                          <input
                            type="text"
                            className="input text-sm mt-1"
                            value={store.address}
                            onChange={(e) => updateStore(store.id, 'address', e.target.value)}
                            placeholder="详细地址"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">联系电话</label>
                            <input
                              type="text"
                              className="input text-sm mt-1"
                              value={store.phone}
                              onChange={(e) => updateStore(store.id, 'phone', e.target.value)}
                              placeholder="联系电话"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">营业时间</label>
                            <input
                              type="text"
                              className="input text-sm mt-1"
                              value={store.businessHours}
                              onChange={(e) => updateStore(store.id, 'businessHours', e.target.value)}
                              placeholder="如：周一至周日 8:00-17:00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button
                type="button"
                className="btn btn-secondary px-6"
                onClick={closeModal}
                disabled={submitting}
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary px-8 gap-2" onClick={handleSubmit} disabled={submitting}>
                <Save className="w-4 h-4" />
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
