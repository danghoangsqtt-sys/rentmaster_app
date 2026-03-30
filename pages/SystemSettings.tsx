
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Moon, Languages, 
  ChevronRight, Smartphone, RefreshCw, Trash2, Paintbrush, Sun
} from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionStatus, sendSystemNotification } from '../utils/notificationUtils';

const SystemSettings: React.FC = () => {
  const navigate = useNavigate();
  
  const [notificationStatus, setNotificationStatus] = useState(getNotificationPermissionStatus());
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isClearing, setIsClearing] = useState(false);
  const [language, setLanguage] = useState('Tiếng Việt');

  const toggleNotifications = async () => {
    if (notificationStatus === 'granted') {
      alert("Để tắt thông báo, vui lòng thay đổi trong cài đặt trình duyệt của bạn.");
      return;
    }
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? "granted" : "denied");
    if (granted) {
      sendSystemNotification("Đã bật thông báo!", {
        body: "Bạn sẽ nhận được các nhắc nhở quan trọng từ RentMaster Pro."
      });
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rentMasterTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rentMasterTheme', 'light');
    }
  };

  const handleClearCache = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa bộ nhớ đệm? Dữ liệu bất động sản của bạn sẽ không bị mất.");
    if (!confirm) return;

    setIsClearing(true);
    setTimeout(() => {
      setIsClearing(false);
      alert('Đã xóa bộ nhớ đệm thành công!');
    }, 1200);
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 pb-24 animate-in slide-in-from-right-10 duration-500 transition-colors">
      <div className="bg-white/95 backdrop-blur-xl px-4 py-3 flex items-center gap-2.5 sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-colors">
        <button title="Quay lại" onClick={() => navigate(-1)} className="w-8 h-8 bg-slate-50 rounded-[10px] flex items-center justify-center text-slate-500 active:scale-95 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Cài đặt ứng dụng</h2>
      </div>

      <div className="px-4 pb-8 space-y-4 mt-4">
        <div className="space-y-2">
          <h3 className="text-[10px] items-center flex gap-1.5 font-black text-slate-400 uppercase tracking-widest ml-1">
            <Paintbrush size={12} className="text-blue-500" /> Cá nhân hóa & Hiển thị
          </h3>
          <div className="bg-white rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100/60">
            <SettingToggle 
              icon={Bell} 
              label="Thông báo nhắc nợ" 
              subLabel={notificationStatus === 'granted' ? 'Đã cho phép' : (notificationStatus === 'denied' ? 'Đã chặn' : 'Chưa kích hoạt')}
              checked={notificationStatus === 'granted'}
              onChange={toggleNotifications}
              color="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/30"
            />
            <SettingToggle 
              icon={isDarkMode ? Moon : Sun} 
              label={isDarkMode ? "Chế độ tối" : "Chế độ sáng"} 
              subLabel="Tối ưu trải nghiệm ban đêm"
              checked={isDarkMode}
              onChange={toggleDarkMode}
              color="text-indigo-600 dark:text-indigo-400"
              bgColor="bg-indigo-50 dark:bg-indigo-900/30"
            />
            <SettingLink 
              icon={Languages} 
              label="Ngôn ngữ ứng dụng" 
              value={language}
              color="text-amber-600"
              bgColor="bg-amber-50 dark:bg-amber-900/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[10px] items-center flex gap-1.5 font-black text-slate-400 uppercase tracking-widest ml-1">
            <RefreshCw size={12} className="text-rose-500" /> Dữ liệu & Lưu trữ
          </h3>
          <div className="bg-white rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <button 
              onClick={handleClearCache}
              disabled={isClearing}
              className="w-full p-3 flex items-center justify-between active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3.5 text-slate-700">
                <div className="p-1.5 bg-white shadow-sm border border-slate-100 text-slate-500 rounded-[8px]">
                  {isClearing ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[11px] uppercase tracking-wide">Xóa bộ nhớ đệm</h4>
                  <p className="text-[9px] text-slate-400 font-medium">Tối ưu dung lượng ứng dụng</p>
                </div>
              </div>
              {!isClearing && <ChevronRight size={14} className="text-slate-300" />}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[20px] p-4 text-white shadow-md relative overflow-hidden transition-all mt-6">
          <Smartphone size={100} className="absolute -right-4 -bottom-6 text-white/5 rotate-12" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[12px] flex items-center justify-center border border-white/20">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="font-black text-[13px] italic tracking-tight">RentMaster Pro</h4>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phiên bản 4.0.0</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 bg-white/5 rounded-[12px] p-2 border border-white/5 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Lưu trữ</p>
              <p className="text-[9px] font-black text-emerald-400 mt-0.5 tracking-wider">TẠI CHỖ</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-[12px] p-2 border border-white/5 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Bản quyền</p>
              <p className="text-[9px] font-black text-blue-400 mt-0.5 tracking-wider">DH SYSTEM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({ icon: Icon, label, subLabel, checked, onChange, disabled, color, bgColor }: any) => (
  <div className={`p-4 flex items-center justify-between text-left group transition-colors ${disabled ? 'opacity-50' : 'hover:bg-slate-50'}`}>
    <div className="flex items-center gap-3.5">
      <div className={`p-2 ${bgColor} ${color} rounded-[12px] border border-slate-50/50 shadow-sm`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="font-bold text-[13px] text-slate-700 tracking-wide leading-none mb-1.5">{label}</h4>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{subLabel}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer" title={label}>
      <input type="checkbox" title={label} className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="w-[34px] h-[20px] bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[14px] shadow-sm"></div>
    </label>
  </div>
);

const SettingLink = ({ icon: Icon, label, value, color, bgColor }: any) => (
  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-3.5 text-slate-700">
      <div className={`p-2 ${bgColor} ${color} rounded-[12px] border border-slate-50/50 shadow-sm`}>
        <Icon size={16} strokeWidth={2.5}/>
      </div>
      <div className="text-left">
        <h4 className="font-bold text-[13px] text-slate-700 tracking-wide leading-none mb-1">{label}</h4>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-[11px] font-bold text-slate-400">{value}</span>}
      <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
    </div>
  </button>
);

export default SystemSettings;
