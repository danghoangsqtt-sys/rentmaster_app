
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Phone, MapPin, 
  ShieldCheck, X, Camera, Plus, Trash2 
} from 'lucide-react';
import PhotoPicker from '../components/PhotoPicker';
import { Owner } from '../types';
import { StorageService } from '../services/StorageService';
import { AppwriteService } from '../services/AppwriteService';
import { useAppContext } from '../data/AppContext';

const OwnerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { owners, updateOwners } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phones: [''],
    address: '',
    avatarUrl: '',
    idCardFront: '',
    idCardBack: ''
  });

  useEffect(() => {
    if (isEdit) {
      const owner = owners.find(o => o.id === id);
      if (owner) {
        setFormData({
          name: owner.name || '',
          phones: owner.phones && owner.phones.length > 0 ? owner.phones : [''],
          address: owner.address || '',
          avatarUrl: owner.avatarUrl || '',
          idCardFront: owner.idCardFront || '',
          idCardBack: owner.idCardBack || ''
        });
      }
    }
  }, [id, isEdit, owners]);

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

  const persistMedia = async (data: string, prefix: string) => {
    if (!data || data.startsWith('file://') || data.startsWith('http')) return data;
    return await AppwriteService.uploadMedia(data, prefix);
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert("Vui lòng nhập tên chủ sở hữu!");
    if (!formData.phones[0]) return alert("Vui lòng nhập ít nhất một số điện thoại!");

    setIsSaving(true);
    try {
      const persistedAvatar = await persistMedia(formData.avatarUrl, 'owner-avatar');
      const persistedIDFront = await persistMedia(formData.idCardFront, 'owner-id-front');
      const persistedIDBack = await persistMedia(formData.idCardBack, 'owner-id-back');

      const ownerData: Owner = {
        id: isEdit ? id! : 'o' + Date.now(),
        name: formData.name,
        phones: formData.phones.filter(p => p !== ''),
        address: formData.address,
        avatarUrl: persistedAvatar,
        idCardFront: persistedIDFront,
        idCardBack: persistedIDBack,
        managementStartDate: isEdit ? (owners.find(o => o.id === id)?.managementStartDate || new Date().toISOString()) : new Date().toISOString()
      };

      if (isEdit) {
        await updateOwners(owners.map(o => o.id === id ? ownerData : o));
      } else {
        await updateOwners([...owners, ownerData]);
      }
      navigate('/properties?tab=owners');
    } catch (error) {
      console.error("Save error", error);
      alert("Đã có lỗi khi lưu hồ sơ chủ sở hữu.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-[14px] p-3 text-[13px] font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="absolute inset-0 bg-white z-[100] flex flex-col font-sans overflow-hidden">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Đang lưu hồ sơ...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl pt-safe pb-3 px-4 border-b border-slate-100 shadow-sm shrink-0 z-50 sticky top-0">
        <div className="flex items-center justify-between pt-3">
          <button title="Quay lại" onClick={() => navigate(-1)} className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-[10px] flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <div className="text-center">
            <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">{isEdit ? 'Cập nhật đối tác' : 'Thêm đối tác'}</h2>
          </div>
          <button title="Đóng" onClick={() => navigate(-1)} className="w-8 h-8 bg-rose-50 border border-rose-100 rounded-[10px] flex items-center justify-center text-rose-500 active:scale-90 transition-transform">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-2">
          <div className="relative group">
            <div className="w-[85px] h-[85px] rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] bg-slate-100 border-2 border-slate-50">
              {formData.avatarUrl ? (
                <img src={StorageService.getDisplayUrl(formData.avatarUrl)} className="w-full h-full object-cover" alt="Ảnh đại diện" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={30} />
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-[10px] flex items-center justify-center border-2 border-white shadow-sm cursor-pointer active:scale-90 transition-transform">
              <Camera size={14} />
              <input 
                id="avatar-upload"
                title="Tải ảnh đại diện"
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
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <label htmlFor="ownerName" className={labelClass}><User size={12}/> Họ và tên chủ nhà</label>
          <input id="ownerName" title="Họ và tên chủ nhà" className={inputClass} placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

          <label htmlFor="ownerAddress" className={labelClass}><MapPin size={12}/> Địa chỉ liên hệ</label>
          <input id="ownerAddress" title="Địa chỉ liên hệ" className={inputClass} placeholder="Số nhà, Phường, Quận..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

          <div className="space-y-2">
            <label className={labelClass}><Phone size={12}/> Số điện thoại</label>
            {formData.phones.map((phone, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  title={`Số điện thoại ${idx + 1}`}
                  className={inputClass} 
                  placeholder="090..." 
                  value={phone} 
                  onChange={e => handlePhoneChange(idx, e.target.value)} 
                />
                {formData.phones.length > 1 && (
                  <button title="Làm rỗng số" onClick={() => handleRemovePhone(idx)} className="h-[52px] w-[52px] bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100 mb-4 active:scale-95 transition-transform">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button title="Thêm số điện thoại" onClick={handleAddPhone} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[11px] font-bold uppercase text-slate-500 flex items-center justify-center gap-2 mb-6 active:scale-95 transition-transform">
              <Plus size={14} /> Thêm số điện thoại
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="p-3.5 bg-blue-50/50 rounded-[16px] border border-blue-100/50">
            <h3 className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-1.5 mb-3"><ShieldCheck size={12}/> Xác thực CMND/CCCD</h3>
            <div className="grid grid-cols-2 gap-2">
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

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex gap-2.5 z-[110] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button title="Lưu thông tin chủ nhà" onClick={handleSubmit} disabled={isSaving} className="w-full flex-[2] py-3 bg-indigo-600 text-white rounded-[12px] text-[11px] font-bold uppercase flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(79,70,229,0.2)] active:scale-95 transition-all disabled:opacity-50">
          Hoàn tất lưu <Save size={14} />
        </button>
      </div>
    </div>
  );
};

export default OwnerForm;
