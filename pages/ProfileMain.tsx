
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, ChevronRight, 
  ShieldCheck, HelpCircle, Sparkles, Zap
} from 'lucide-react';
import { getStoredProfile } from '../data/mockData';

const ProfileMain: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const prof = await getStoredProfile();
      setProfile(prof);
    };
    load();
  }, []);

  const menuItems = [
    { 
      label: 'Thông tin cá nhân', 
      icon: User, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      path: '/profile/info'
    },
    { 
      label: 'Cài đặt ứng dụng', 
      icon: Settings, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50',
      path: '/profile/settings'
    }
  ];

  return (
    <div className="min-h-full bg-slate-50 pb-24 animate-in fade-in duration-500 pt-safe">
      <div className="bg-white px-6 pt-12 pb-10 rounded-b-[3.5rem] shadow-sm border-b border-slate-100 flex flex-col items-center text-center">
        <div className="relative group">
          <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl group-active:scale-95 transition-transform bg-slate-100">
            <img 
              src={profile?.photo || 'https://i.pravatar.cc/150?u=manager'} 
              alt={profile?.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-600 w-9 h-9 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
            <Zap size={16} className="fill-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-5 leading-none tracking-tight">{profile?.name || 'Quản lý viên'}</h2>
        <p className="text-xs text-slate-400 font-medium mt-2">{profile?.email || 'Tính năng ngoại tuyến'}</p>
        
        <div className="mt-6 flex gap-2">
          <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-100 flex items-center gap-2">
            <Sparkles size={12} /> Phiên bản đầy đủ
          </div>
        </div>
      </div>

      <div className="p-5 space-y-8">
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button 
                key={idx}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.75rem] shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all group relative"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 ${item.bg} ${item.color} rounded-2xl`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-700">{item.label}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Hỗ trợ & Thông tin</h3>
          <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4 text-slate-600">
                <ShieldCheck size={20} />
                <span className="font-bold text-sm">Bảo mật dữ liệu offline</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4 text-slate-600">
                <HelpCircle size={20} />
                <span className="font-bold text-sm">Hướng dẫn sử dụng</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>
        </div>

        <div className="text-center pt-6 pb-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            RentMaster Pro • @2025 DHsystem
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileMain;
