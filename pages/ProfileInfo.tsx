import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAppContext } from '../data/AppContext';
import { StorageService } from '../services/StorageService';
import { AppwriteService } from '../services/AppwriteService';

const ProfileInfo: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, updateProfile } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalPhoto = formData.photo;
      if (formData.photo && formData.photo.startsWith('data:')) {
        finalPhoto = await AppwriteService.uploadMedia(formData.photo, 'user-profile');
      }
      
      await updateProfile({ ...formData, photo: finalPhoto });
      navigate(-1);
    } catch (error) {
      console.error("Save profile error", error);
      alert("Lỗi khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 pb-20 animate-in slide-in-from-right-10 duration-500 font-sans">
      {isSaving && (
        <div className="absolute inset-0 z-[1000] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="bg-white/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-colors">
        <div className="flex items-center gap-2.5">
          <button title="Quay lại" onClick={() => navigate(-1)} className="w-8 h-8 bg-slate-50 rounded-[10px] flex items-center justify-center text-slate-500 active:scale-95 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Hồ sơ cá nhân</h2>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50">
          <Save size={12} /> Lưu thay đổi
        </button>
      </div>

      <div className="p-4 space-y-6 mt-2">
        {/* Avatar Section Tinh gọn */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] bg-white p-0.5 relative z-10 transition-transform active:scale-95">
              <img src={StorageService.getDisplayUrl(formData.photo) || 'https://i.pravatar.cc/150?u=manager'} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <button 
              title="Đổi ảnh đại diện"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 -right-2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-20 hover:bg-blue-700 transition-colors"
            >
              <Camera size={12} strokeWidth={2.5} />
            </button>
            <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2.5">Ảnh đại diện thẻ (Card ID)</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1.5 flex items-center gap-1.5 pt-2">
             <User size={10}/> Thông tin cơ bản
          </h3>
          <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-slate-100/50 overflow-hidden">
            {/* Input Hàng ngang chuẩn iOS */}
            <div className="px-4 py-3.5 flex items-center justify-between group focus-within:bg-blue-50/20 transition-colors">
               <div className="flex items-center gap-2 text-slate-600 w-[110px] shrink-0">
                  <span className="font-bold text-[12px] uppercase">Tên gọi</span>
               </div>
               <input 
                 id="profileName" title="Tên hiển thị"
                 className="flex-1 bg-transparent text-right text-[13px] font-black text-slate-800 outline-none placeholder:text-slate-300 placeholder:font-bold"
                 placeholder="Nhập tên hiển thị"
                 value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
               />
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between group focus-within:bg-blue-50/20 transition-colors">
               <div className="flex items-center gap-2 text-slate-600 w-[110px] shrink-0">
                  <span className="font-bold text-[12px] uppercase">Email</span>
               </div>
               <input 
                 id="profileEmail" title="Email liên hệ" type="email"
                 className="flex-1 bg-transparent text-right text-[13px] font-black text-slate-800 outline-none placeholder:text-slate-300 placeholder:font-bold"
                 placeholder="app@example.com"
                 value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
               />
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between group focus-within:bg-blue-50/20 transition-colors">
               <div className="flex items-center gap-2 text-slate-600 w-[110px] shrink-0">
                  <span className="font-bold text-[12px] uppercase">Điện thoại</span>
               </div>
               <input 
                 id="profilePhone" title="Số điện thoại" type="tel"
                 className="flex-1 bg-transparent text-right text-[13px] font-black text-slate-800 outline-none placeholder:text-slate-300 placeholder:font-bold"
                 placeholder="09xx.xxx.xxx"
                 value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
               />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1.5 flex items-center gap-1.5">
             <MapPin size={10}/> Quy định / Thông điệp
          </h3>
          <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
             <textarea 
               id="profileBio" title="Ghi chú khu vực"
               className="w-full bg-transparent p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-blue-50/10 placeholder:text-slate-300 transition-colors resize-none"
               rows={3}
               placeholder="Ghi chú khu vực quản lý hoặc khẩu hiệu (Tùy chọn)"
               value={formData.bio} onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
             />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileInfo;
