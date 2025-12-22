
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Mail, Phone, MapPin } from 'lucide-react';
import { getStoredProfile, saveProfile } from '../data/mockData';
import { StorageService } from '../services/StorageService';

const ProfileInfo: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    bio: ''
  });

  useEffect(() => {
    const load = async () => {
      const p = await getStoredProfile();
      setFormData(p);
    };
    load();
  }, []);

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
        finalPhoto = await StorageService.saveMedia(formData.photo, 'user-profile');
      }
      
      await saveProfile({ ...formData, photo: finalPhoto });
      navigate(-1);
    } catch (error) {
      console.error("Save profile error", error);
      alert("Lỗi khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 pb-20 animate-in slide-in-from-right-10 duration-500">
      {isSaving && (
        <div className="absolute inset-0 z-[1000] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 bg-slate-50 rounded-lg text-slate-500 active:scale-90 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Thông tin cá nhân</h2>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50">
          <Save size={14} /> Lưu lại
        </button>
      </div>

      <div className="p-5 space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100">
              <img src={StorageService.getDisplayUrl(formData.photo) || 'https://i.pravatar.cc/150?u=manager'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg active:scale-90 transition-transform"
            >
              <Camera size={14} strokeWidth={2.5} />
            </button>
            <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Nhấn vào icon để đổi ảnh</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <User size={10} className="text-blue-500" /> Tên hiển thị
            </label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Mail size={10} className="text-blue-500" /> Email liên hệ
            </label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Phone size={10} className="text-blue-500" /> Số điện thoại
            </label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <MapPin size={10} className="text-blue-500" /> Ghi chú/Khu vực
            </label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              rows={3}
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
