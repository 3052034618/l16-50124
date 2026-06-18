import { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, Store, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { api } from '../../services/api';
import type { Institution } from '../../../shared/types';

export default function HrInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        <button className="btn btn-primary gap-2">
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
                <button className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors">
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
                <Store className="w-4 h-4 text-gray-400" />
                <span>下属门店 ({inst.stores.length})</span>
              </div>
              <div className="space-y-2">
                {inst.stores.slice(0, 2).map((store) => (
                  <div key={store.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-700 truncate">{store.name}</div>
                      <div className="text-xs text-gray-400 truncate">{store.address}</div>
                    </div>
                  </div>
                ))}
                {inst.stores.length > 2 && (
                  <button className="w-full text-sm text-primary-500 hover:text-primary-600 py-1">
                    查看全部 {inst.stores.length} 个门店
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
