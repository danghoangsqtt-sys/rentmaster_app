
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, CalendarClock, Wallet, 
  Droplets, AlertCircle, ChevronRight, CheckCircle2,
  Settings, ShieldCheck, BellRing
} from 'lucide-react';
// Changed mockProperties to getStoredProperties
import { getStoredProperties } from '../data/mockData';
import { getPropertyAlerts } from '../utils/alertUtils';
import { requestNotificationPermission, getNotificationPermissionStatus, sendSystemNotification } from '../utils/notificationUtils';
import { AppNotification } from '../types';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());
  const [allAlerts, setAllAlerts] = useState<AppNotification[]>([]);
  
  // Use useEffect to fetch properties asynchronously and calculate alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      const props = await getStoredProperties();
      const alerts = props.flatMap(p => getPropertyAlerts(p));
      setAllAlerts(alerts);
    };
    fetchAlerts();
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? "granted" : "denied");
    if (granted) {
      sendSystemNotification("Đã bật thông báo!", {
        body: "Bạn sẽ nhận được nhắc nhở về tiền nhà và hợp đồng ngay tại đây."
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-full pb-20 animate-in slide-in-from-right-10 duration-500">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl text-slate-500 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Thông báo</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Permission Banner */}
        {permissionStatus !== "granted" && (
          <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <BellRing size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-[11px] font-black uppercase tracking-wider">Thông báo hệ thống</h4>
              <p className="text-[10px] opacity-90 font-medium leading-snug mt-1">Cho phép gửi nhắc nhở ra màn hình khóa điện thoại</p>
            </div>
            <button 
              onClick={handleRequestPermission}
              className="bg-white text-blue-600 px-3 py-2 rounded-lg text-[9px] font-black uppercase shadow-sm active:scale-95 transition-transform"
            >
              Kích hoạt
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách cảnh báo</h3>
          <span className="text-[9px] font-black text-slate-300 uppercase">{allAlerts.length} tin mới</span>
        </div>

        {allAlerts.length === 0 ? (
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
            {allAlerts.map(alert => (
              <button 
                key={alert.id}
                onClick={() => navigate(`/property/${alert.propertyId}`)}
                className="w-full flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-left group active:bg-slate-50 transition-colors"
              >
                <div className={`mr-4 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                   alert.type === 'RENT_DUE' ? 'bg-rose-50 text-rose-600' : 
                   alert.type === 'CONTRACT_EXPIRY' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Bell size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase truncate pr-2">{alert.propertyName}</h4>
                    <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">{alert.dueDate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-1 leading-tight font-medium">{alert.message}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
