
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
      <div className="bg-white dark:bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <button onClick={() => navigate(-1)} className="p-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Cài đặt ứng dụng</h2>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-2.5">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Paintbrush size={10} /> Cá nhân hóa & Hiển thị
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-50 dark:divide-slate-700 transition-colors">
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

        <div className="space-y-2.5">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <RefreshCw size={10} /> Dữ liệu & Lưu trữ
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <button 
              onClick={handleClearCache}
              disabled={isClearing}
              className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl">
                  {isClearing ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-xs">Xóa bộ nhớ đệm</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Tối ưu hóa dung lượng ứng dụng</p>
                </div>
              </div>
              {!isClearing && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all">
          <Smartphone size={100} className="absolute -right-6 -bottom-6 text-white/5 rotate-12" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Smartphone size={24} />
            </div>
            <div>
              <h4 className="font-black text-sm italic tracking-tight">RentMaster Pro</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Version 3.0.0 • @2025 DHsystem</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <div className="flex-1 bg-white/5 rounded-xl p-2.5 border border-white/5 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase">Lưu trữ</p>
              <p className="text-[10px] font-bold text-emerald-400 mt-0.5">Tại chỗ</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-2.5 border border-white/5 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase">Quyền hạn</p>
              <p className="text-[10px] font-bold text-blue-400 mt-0.5">Vĩnh viễn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({ icon: Icon, label, subLabel, checked, onChange, disabled, color, bgColor }: any) => (
  <div className={`p-4 flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`p-2 ${bgColor} ${color} rounded-xl`}>
        <Icon size={18} />
      </div>
      <div>
        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200">{label}</h4>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{subLabel}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
    </label>
  </div>
);

const SettingLink = ({ icon: Icon, label, value, color, bgColor }: any) => (
  <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700 transition-colors">
    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
      <div className={`p-2 ${bgColor} ${color} rounded-xl`}>
        <Icon size={18} />
      </div>
      <div className="text-left">
        <h4 className="font-bold text-xs">{label}</h4>
        {value && <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{value}</p>}
      </div>
    </div>
    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
  </button>
);

export default SystemSettings;
