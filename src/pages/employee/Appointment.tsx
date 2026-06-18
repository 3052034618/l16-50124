import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Check, ChevronLeft, ChevronRight, Package, Building2, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import type { Package as PackageType, Institution, Store } from '../../../shared/types';

const steps = [
  { id: 1, label: '选择套餐' },
  { id: 2, label: '选择门店' },
  { id: 3, label: '选择时间' },
  { id: 4, label: '确认预约' },
];

export default function EmployeeAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, instRes] = await Promise.all([
          api.get<PackageType[]>('/packages'),
          api.get<Institution[]>('/institutions'),
        ]);

        if (pkgRes.success && pkgRes.data) {
          setPackages(pkgRes.data);
        }
        if (instRes.success && instRes.data) {
          setInstitutions(instRes.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPackage = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleSelectInstitution = async (inst: Institution) => {
    setSelectedInstitution(inst);
    setStores(inst.stores);
    setSelectedStore(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setStep(3);
    if (store.dates.length > 0) {
      setSelectedDate(store.dates[0].date);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleConfirm = async () => {
    if (!selectedPackage || !selectedInstitution || !selectedStore || !selectedDate || !selectedTime) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.post('/appointments', {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        institutionId: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        storeId: selectedStore.id,
        storeName: selectedStore.name,
        storeAddress: selectedStore.address,
        appointmentDate: selectedDate,
        timeSlot: selectedTime,
      });

      if (result.success) {
        alert('预约成功！');
        navigate('/employee/my-appointments');
      } else {
        alert(result.error || '预约失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentDateSlots = selectedStore?.dates.find(d => d.date === selectedDate)?.slots || [];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-sm ${step >= s.id ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > s.id ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            选择体检套餐
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className="p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{pkg.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pkg.applicableGender === 'all' ? 'bg-gray-100 text-gray-600' :
                    pkg.applicableGender === 'male' ? 'bg-primary-50 text-primary-600' :
                    'bg-danger-50 text-danger-600'
                  }`}>
                    {pkg.applicableGender === 'all' ? '不限' : pkg.applicableGender === 'male' ? '男' : '女'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pkg.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary-600">¥{pkg.price}</span>
                    {pkg.originalPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">¥{pkg.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{pkg.items.length} 项</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-500" />
              选择体检机构
            </h3>
          </div>

          <div className="space-y-4">
            {institutions.map((inst) => (
              <div
                key={inst.id}
                className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedInstitution?.id === inst.id
                    ? 'border-primary-500 bg-primary-50/30'
                    : 'border-gray-100 hover:border-primary-300'
                }`}
                onClick={() => handleSelectInstitution(inst)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{inst.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{inst.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{inst.stores.length} 家门店</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {[...new Set(inst.stores.map(s => s.district))].join('、')}
                      </span>
                    </div>
                  </div>
                  {selectedInstitution?.id === inst.id && (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedInstitution && stores.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4">选择门店</h4>
              <div className="space-y-3">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleSelectStore(store)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStore?.id === store.id
                        ? 'border-primary-500 bg-primary-50/30'
                        : 'border-gray-100 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{store.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{store.address}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{store.phone}</span>
                          <span>{store.businessHours}</span>
                        </div>
                      </div>
                      {selectedStore?.id === store.id && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedStore && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep(2)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              选择预约时间
            </h3>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">选择日期</h4>
            <div className="flex gap-2 flex-wrap">
              {selectedStore.dates.map((dateObj) => (
                <button
                  key={dateObj.date}
                  onClick={() => handleSelectDate(dateObj.date)}
                  className={`px-4 py-3 rounded-lg text-center transition-all ${
                    selectedDate === dateObj.date
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium">{dateObj.date}</div>
                  <div className={`text-xs mt-1 ${
                    selectedDate === dateObj.date ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {dateObj.slots.reduce((sum, s) => sum + s.available, 0)} 个可约名额
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">选择时段</h4>
              <div className="grid grid-cols-4 gap-3">
                {currentDateSlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={slot.available === 0}
                    onClick={() => handleSelectTime(slot.time)}
                    className={`py-3 rounded-lg text-center transition-all ${
                      selectedTime === slot.time
                        ? 'bg-primary-500 text-white'
                        : slot.available === 0
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedTime === slot.time ? 'text-white/80' : 'text-gray-400'
                    }`}>
                      剩余 {slot.available}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && selectedPackage && selectedStore && selectedDate && selectedTime && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep(3)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">确认预约信息</h3>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{selectedPackage.name}</div>
                <div className="text-sm text-gray-500 mt-1">{selectedPackage.description}</div>
                <div className="text-lg font-bold text-primary-600 mt-2">
                  <DollarSign className="w-5 h-5 inline" />
                  {selectedPackage.price}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">体检机构</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{selectedInstitution?.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">体检门店</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{selectedStore.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{selectedStore.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">预约日期</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{selectedDate}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">预约时段</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{selectedTime}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setStep(3)}
              className="btn btn-secondary px-6"
            >
              返回修改
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="btn btn-primary px-8"
            >
              {submitting ? '提交中...' : '确认预约'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
