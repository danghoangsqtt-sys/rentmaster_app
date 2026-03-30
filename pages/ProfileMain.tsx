import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, ChevronRight, 
  ShieldCheck, HelpCircle, Sparkles, Zap, Shield
} from 'lucide-react';
import { useAppContext } from '../data/AppContext';

const ProfileMain: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAppContext();

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
    <div className="min-h-full bg-slate-50 pb-24 animate-in fade-in duration-500 pt-safe font-sans">
      {/* Nâng cấp Header thành giao diện Ngang (Horizontal Compact Style) */}
      <div className="bg-white/90 backdrop-blur-xl px-4 py-5 shadow-sm border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 transition-colors">
         <div className="flex items-center gap-3.5">
             <div className="relative group shrink-0">
               <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                 <img 
                   src={profile?.photo || 'https://i.pravatar.cc/150?u=manager'} 
                   alt={profile?.name} 
                   className="w-full h-full object-cover"
                 />
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                 <Zap size={10} className="fill-white text-white" />
               </div>
             </div>
             <div>
               <h2 className="text-[17px] font-black text-slate-800 leading-none tracking-tight">{profile?.name || 'Quản lý viên'}</h2>
               <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
                 <Sparkles size={11} className="text-amber-500" />
                 {profile?.email || 'Hệ thống ngoại tuyến'}
               </p>
             </div>
         </div>
         <div className="shrink-0 flex items-center">
            {/* Version Badge Gọn Gàng */}
            <div className="px-2.5 py-1 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 mr-1 flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform">
               PRO
            </div>
         </div>
      </div>

      <div className="p-4 space-y-6 mt-2">
        {/* Menu Nhóm 1: Hệ thống lõi */}
        <div className="space-y-2">
          <h3 className="text-[10px] items-center flex gap-1.5 font-black text-slate-400 uppercase tracking-widest ml-1"><User size={12} className="text-blue-500" /> Tài khoản & Dữ liệu</h3>
          <div className="bg-white rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-slate-100/60 overflow-hidden">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group relative"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 ${item.bg} ${item.color} rounded-[12px] border border-slate-50/50 shadow-sm`}>
                      <Icon size={16} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-[13px] text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 group-active:text-blue-500 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Nhóm 2: Hỗ trợ */}
        <div className="space-y-2">
          <h3 className="text-[10px] items-center flex gap-1.5 font-black text-slate-400 uppercase tracking-widest ml-1"><Shield size={12} className="text-emerald-500" /> Hỗ trợ khách hàng</h3>
          <div className="bg-white rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-slate-100/60 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-[12px] border border-emerald-50 shadow-sm">
                  <ShieldCheck size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[13px] text-slate-700">Kiểm định An toàn Offline</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3.5">
                <div className="p-2 bg-slate-50 text-slate-500 rounded-[12px] border border-slate-50/50 shadow-sm">
                  <HelpCircle size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[13px] text-slate-700">Trung tâm trợ giúp</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Chữ ký Cty */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">
            RENT MASTER PRO
          </p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            Developed by DH System @2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileMain;
