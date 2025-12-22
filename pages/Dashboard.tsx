
import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, AlertCircle, Sparkles, Calendar, ShieldAlert,
  Home, ArrowRight, ClipboardCheck, CheckCircle2,
  ArrowUpRight, TrendingUp
} from 'lucide-react';
import { getStoredProperties, getStoredOwners, getStoredSchedule, getStoredProfile } from '../data/mockData';
import { getPropertyAlerts } from '../utils/alertUtils';
import { Property, Owner, ScheduleEvent } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadAllData = async () => {
      const [p, o, s, pr] = await Promise.all([
        getStoredProperties(),
        getStoredOwners(),
        getStoredSchedule(),
        getStoredProfile()
      ]);
      setProperties(p);
      setOwners(o);
      setSchedule(s);
      setProfile(pr);
    };
    loadAllData();
  }, []);

  const stats = useMemo(() => {
    const rented = properties.filter(p => p.status === 'Rented').length;
    const allAlerts = properties.flatMap(p => getPropertyAlerts(p));
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = schedule.filter(s => s.date === today && !s.isCompleted);

    return {
      total: properties.length,
      owners: owners.length,
      rented: rented,
      available: properties.length - rented,
      allAlerts: allAlerts,
      todayTasks
    };
  }, [properties, owners, schedule]);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-900 min-h-full">
      {/* Welcome Header */}
      <section className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 italic tracking-tight">
            Chào {profile?.name.split(' ').pop() || 'bạn'}! <Sparkles size={20} className="text-amber-400 animate-pulse" />
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Quản lý hiệu quả cùng RentMaster</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-700 shadow-sm">
          <TrendingUp size={24} />
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Tổng căn hộ" 
          value={stats.total} 
          icon={Building2} 
          color="text-blue-600" 
          bgColor="bg-blue-50 dark:bg-blue-900/20" 
          onClick={() => navigate('/properties')} 
        />
        <StatCard 
          label="Đã cho thuê" 
          value={stats.rented} 
          icon={CheckCircle2} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50 dark:bg-emerald-900/20" 
          onClick={() => navigate('/properties')} 
        />
        <StatCard 
          label="Căn hộ trống" 
          value={stats.available} 
          icon={Home} 
          color="text-amber-600" 
          bgColor="bg-amber-50 dark:bg-amber-900/20" 
          onClick={() => navigate('/properties')} 
        />
        <StatCard 
          label="Cảnh báo mới" 
          value={stats.allAlerts.length} 
          icon={ShieldAlert} 
          color="text-rose-600" 
          bgColor="bg-rose-50 dark:bg-rose-900/20" 
          onClick={() => navigate('/notifications')} 
        />
      </div>

      {/* Today's Tasks */}
      {stats.todayTasks.length > 0 && (
        <section onClick={() => navigate('/schedule')} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 flex items-center gap-4 active:scale-95 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Lịch trình hôm nay</p>
            <p className="text-sm font-bold mt-0.5 text-slate-800 dark:text-white">Bạn có {stats.todayTasks.length} việc cần hoàn tất</p>
          </div>
          <ArrowRight size={20} className="text-slate-300" />
        </section>
      )}

      {/* Critical Alerts List */}
      <section className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông báo quan trọng</h3>
          <button onClick={() => navigate('/notifications')} className="text-[10px] font-bold text-blue-600 uppercase">Tất cả</button>
        </div>

        <div className="space-y-3">
          {stats.allAlerts.length > 0 ? stats.allAlerts.slice(0, 4).map((alert) => (
            <div 
              key={alert.id} 
              onClick={() => navigate(`/property/${alert.propertyId}`)}
              className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-50 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="mr-3 w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{alert.propertyName}</h4>
                <p className="text-[10px] text-slate-500 truncate mt-1 font-medium">{alert.message}</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 ml-2" />
            </div>
          )) : (
             <div className="py-12 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
                  <ClipboardCheck size={24} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách trống</p>
             </div>
          )}
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="py-8 text-center">
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
          RentMaster Pro • @2025 DHsystem
        </p>
      </footer>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bgColor, onClick }: any) => (
  <button onClick={onClick} className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm text-left active:scale-[0.97] transition-all relative overflow-hidden group">
    <div className={`${bgColor} ${color} w-11 h-11 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
      <Icon size={22} />
    </div>
    <div className="flex flex-col">
      <div className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-2 whitespace-nowrap">{label}</div>
    </div>
    <div className="absolute top-4 right-4 text-slate-200 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowUpRight size={14} />
    </div>
  </button>
);

export default Dashboard;
