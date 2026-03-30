
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, CalendarClock, Wallet, 
  Droplets, AlertCircle, ChevronRight, CheckCircle2,
  Settings, ShieldCheck, BellRing, Globe
} from 'lucide-react';
import { useAppContext } from '../data/AppContext';
import { getPropertyAlerts } from '../utils/alertUtils';
import { requestNotificationPermission, getNotificationPermissionStatus, sendSystemNotification } from '../utils/notificationUtils';
import { AppNotification } from '../types';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());
  const [activeTab, setActiveTab] = useState<'all' | 'finance' | 'legal'>('all');
  const [allAlerts, setAllAlerts] = useState<AppNotification[]>([]);
  
  const { properties } = useAppContext();
  
  useEffect(() => {
    const fetchAlerts = () => {
      const alerts = properties.flatMap((p: any) => getPropertyAlerts(p));
      setAllAlerts(alerts);
    };
    fetchAlerts();
  }, [properties]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? "granted" : "denied");
    if (granted) {
      sendSystemNotification("Đã bật thông báo!", {
        body: "Bạn sẽ nhận được nhắc nhở về tiền nhà và hợp đồng ngay tại đây."
      });
    }
  };

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      if (activeTab === 'finance') {
        return ['RENT_DUE', 'ELECTRICITY_DUE', 'WATER_DUE', 'MANAGEMENT_DUE', 'WIFI_DUE', 'OWNER_ELECTRICITY_DUE', 'OWNER_WATER_DUE', 'OWNER_WIFI_DUE'].includes(alert.type);
      }
      if (activeTab === 'legal') {
        return ['CONTRACT_EXPIRY', 'VISA_EXPIRY'].includes(alert.type);
      }
      return true;
    });
  }, [allAlerts, activeTab]);

  const getUrgencyBadge = (dueDateStr: string, message: string) => {
    const isOverdue = dueDateStr.includes("Quá hạn") || message.includes("TRỄ HẠN") || message.includes("QUÁ HẠN");
    const isToday = dueDateStr === "Hôm nay" || message.includes("hôm nay");
    
    if (isOverdue) return "text-rose-600 bg-rose-50 border-rose-100/60";
    if (isToday) return "text-amber-600 bg-amber-50 border-amber-100/60";
    return "text-slate-500 bg-slate-50 border-slate-100/60";
  };

  return (
    <div className="bg-slate-50 min-h-full pb-20 animate-in slide-in-from-right-10 duration-500">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <button title="Quay lại" onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl text-slate-500 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Thông báo</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Permission Banner (Slim) */}
        {permissionStatus !== "granted" && (
          <div className="bg-slate-800 rounded-[14px] p-3 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <BellRing size={14} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold tracking-widest uppercase">Bật Thông báo App</h4>
                <p className="text-[9px] opacity-70 mt-0.5">Nhận cảnh báo trễ hạn tức thời</p>
              </div>
            </div>
            <button 
              onClick={handleRequestPermission}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-[8px] text-[9px] font-black uppercase active:scale-95 transition-transform"
            >
              Kích hoạt
            </button>
          </div>
        )}

        {/* Tabs Filter */}
        <div className="flex items-center gap-2 mb-2 pb-1 overflow-x-auto scrollbar-hide snap-x">
           <button onClick={() => setActiveTab('all')} className={`px-4 py-2 shrink-0 snap-start rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'all' ? 'bg-slate-800 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'} `}>Tất cả</button>
           <button onClick={() => setActiveTab('finance')} className={`px-4 py-2 shrink-0 snap-start rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'finance' ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'} `}>Tài chính</button>
           <button onClick={() => setActiveTab('legal')} className={`px-4 py-2 shrink-0 snap-start rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'legal' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'} `}>Pháp lý</button>
        </div>

        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách cảnh báo</h3>
          <span className="text-[9px] font-black text-slate-300 uppercase">{filteredAlerts.length} tin mới</span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 uppercase">Tuyệt vời!</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mọi thứ đều đang được vận hành ổn định</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAlerts.map(alert => (
              <button 
                key={alert.id}
                onClick={() => navigate(`/property/${alert.propertyId}`)}
                className="w-full flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left group active:scale-[0.98] transition-all"
              >
                <div className={`mr-4 w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${
                   alert.type.includes('VISA_EXPIRY') ? 'bg-rose-50 text-rose-500 border border-rose-100/50' :
                   alert.type.includes('ELECTRICITY') ? 'bg-amber-50 text-amber-500 border border-amber-100/50' :
                   alert.type.includes('WATER') ? 'bg-cyan-50 text-cyan-500 border border-cyan-100/50' :
                   alert.type.includes('WIFI') ? 'bg-indigo-50 text-indigo-500 border border-indigo-100/50' :
                   alert.type === 'RENT_DUE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                   alert.type === 'CONTRACT_EXPIRY' ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-blue-50 text-blue-600 border border-blue-100/50'
                }`}>
                  {alert.type.includes('VISA_EXPIRY') ? <Globe size={18} strokeWidth={2.5} /> :
                   alert.type.includes('ELECTRICITY') ? <AlertCircle size={18} strokeWidth={2.5} /> :
                   alert.type.includes('WATER') ? <Droplets size={18} strokeWidth={2.5} /> :
                   alert.type.includes('WIFI') ? <ShieldCheck size={18} strokeWidth={2.5} /> :
                   alert.type === 'CONTRACT_EXPIRY' ? <CalendarClock size={18} strokeWidth={2.5} /> :
                   alert.type === 'RENT_DUE' ? <Wallet size={18} strokeWidth={2.5} /> :
                   <Bell size={18} strokeWidth={2.5} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase truncate pr-2 leading-none">{alert.propertyName}</h4>
                    <span className={`text-[8px] font-black uppercase shrink-0 px-2 py-0.5 rounded-[6px] border ${getUrgencyBadge(alert.dueDate, alert.message)}`}>{alert.dueDate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-bold">{alert.message}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 ml-2 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
