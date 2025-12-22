
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Phone, MapPin, 
  ShieldCheck, X, Camera, Plus, Trash2 
} from 'lucide-react';
import PhotoPicker from '../components/PhotoPicker';
import { Owner } from '../types';
import { saveOwners, getStoredOwners } from '../data/mockData';

const OwnerForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phones: [''],
    address: '',
    avatarUrl: '',
    idCardFront: '',
    idCardBack: ''
  });

  const handleAddPhone = () => {
    setFormData({ ...formData, phones: [...formData.phones, ''] });
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData({ ...formData, phones: newPhones });
  };

  const handleRemovePhone = (index: number) => {
    if (formData.phones.length > 1) {
      setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert("Vui lòng nhập tên chủ sở hữu!");
    if (!formData.phones[0]) return alert("Vui lòng nhập ít nhất một số điện thoại!");

    const newOwner: Owner = {
      id: 'o' + Date.now(),
      name: formData.name,
      phones: formData.phones.filter(p => p !== ''),
      address: formData.address,
      avatarUrl: formData.avatarUrl,
      idCardFront: formData.idCardFront,
      idCardBack: formData.idCardBack,
      managementStartDate: new Date().toISOString()
    };

    const storedOwners = await getStoredOwners();
    await saveOwners([...storedOwners, newOwner]);
    navigate('/properties'); // Quay lại danh sách
  };

  const inputClass = "w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all mb-4 shadow-sm";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 flex items-center gap-2";

  return (
    <div className="absolute inset-0 bg-slate-50 z-[100] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white pt-safe pb-6 px-6 border-b border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center justify-between pt-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Thêm chủ sở hữu</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase">Hồ sơ đối tác</p>
          </div>
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-40">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={40} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg cursor-pointer active:scale-90 transition-transform">
              <Camera size={14} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({ ...formData, avatarUrl: reader.result as string });
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase mt-3">Ảnh đại diện</p>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <label className={labelClass}><User size={12}/> Họ và tên chủ nhà</label>
          <input className={inputClass} placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

          <label className={labelClass}><MapPin size={12}/> Địa chỉ liên hệ</label>
          <input className={inputClass} placeholder="Số nhà, Phường, Quận..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

          <div className="space-y-2">
            <label className={labelClass}><Phone size={12}/> Số điện thoại</label>
            {formData.phones.map((phone, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  className={inputClass} 
                  placeholder="090..." 
                  value={phone} 
                  onChange={e => handlePhoneChange(idx, e.target.value)} 
                />
                {formData.phones.length > 1 && (
                  <button onClick={() => handleRemovePhone(idx)} className="h-[52px] w-[52px] bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 border-2 border-rose-50 mb-4">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={handleAddPhone} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2 mb-6">
              <Plus size={14} /> Thêm số điện thoại
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100">
            <h3 className="text-[10px] font-black text-blue-700 uppercase flex items-center gap-2 mb-4"><ShieldCheck size={14}/> Xác thực danh tính (CCCD/CMND)</h3>
            <div className="grid grid-cols-2 gap-4">
              <PhotoPicker 
                label="MẶT TRƯỚC" 
                images={formData.idCardFront ? [formData.idCardFront] : []} 
                onChange={imgs => setFormData({...formData, idCardFront: imgs[0] || ''})} 
              />
              <PhotoPicker 
                label="MẶT SAU" 
                images={formData.idCardBack ? [formData.idCardBack] : []} 
                onChange={imgs => setFormData({...formData, idCardBack: imgs[0] || ''})} 
              />
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 z-[110] pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl">
        <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-slate-200">
          LƯU THÔNG TIN CHỦ NHÀ <Save size={16} />
        </button>
      </div>
    </div>
  );
};

export default OwnerForm;
