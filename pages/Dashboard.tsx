import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, AlertTriangle, ArrowRight,
  TrendingUp, CheckCircle2, Home, Newspaper
} from 'lucide-react';
import { getPropertyAlerts } from '../utils/alertUtils';
import { useAppContext } from '../data/AppContext';

interface NewsItem {
  title: string;
  link: string;
  thumbnail: string;
  pubDate: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { properties, owners, schedule, profile } = useAppContext();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    // Fetch RSS feed via rss2json API to bypass CORS
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://vnexpress.net/rss/bat-dong-san.rss')
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setNews(data.items.slice(0, 5));
        }
      })
      .catch(err => console.error("Error fetching news:", err))
      .finally(() => setNewsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const rented = properties.filter(p => p.status === 'Rented').length;
    const sold = properties.filter(p => p.status === 'Sold').length;
    const available = properties.filter(p => p.status === 'Available').length;
    const allAlerts = properties.flatMap(p => getPropertyAlerts(p));
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = schedule.filter(s => s.date === today && !s.isCompleted);

    return {
      total: properties.length,
      owners: owners.length,
      rented: rented,
      sold: sold,
      available: available,
      allAlerts: allAlerts,
      todayTasks
    };
  }, [properties, owners, schedule]);

  return (
    <div className="animate-in fade-in duration-500 bg-white min-h-full pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <section className="pt-4 px-5">

        {/* My Activity / Efficiency Card - Reduced Sizes */}
        <div className="bg-slate-50/80 rounded-[1.5rem] p-4 border border-slate-100/60 shadow-sm relative overflow-hidden backdrop-blur-xl">
           <div className="flex justify-between items-start relative z-10">
             <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hiệu suất cho thuê</p>
               <div className="flex items-baseline gap-1.5 mt-0.5">
                 <span className="text-xl font-black text-slate-900 tracking-tight">{stats.rented}</span>
                 <span className="text-[10px] font-bold text-slate-400">/ {stats.total} phòng</span>
               </div>
             </div>
             <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 border border-slate-100 shrink-0">
               <TrendingUp size={14} strokeWidth={2.5}/>
             </div>
           </div>

           <div className="mt-4 flex items-center justify-between relative z-10">
             <div className="flex-1 pr-3 border-r border-slate-200/60">
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Đã thuê
                </div>
                <div className="text-sm font-black text-slate-800">{stats.rented}</div>
             </div>
             <div className="flex-1 px-3 border-r border-slate-200/60">
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Đã bán
                </div>
                <div className="text-sm font-black text-slate-800">{stats.sold}</div>
             </div>
             <div className="flex-1 pl-3">
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Trống
                </div>
                <div className="text-sm font-black text-slate-800">{stats.available}</div>
             </div>
           </div>

           {/* A subtle progress bar */}
           <div className="w-full h-1 bg-slate-200/50 rounded-full mt-3 overflow-hidden relative z-10 flex">
             <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.total > 0 ? (stats.rented / stats.total) * 100 : 0}%` }}></div>
             <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${stats.total > 0 ? (stats.sold / stats.total) * 100 : 0}%` }}></div>
           </div>
           
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"></div>
        </div>
      </section>

      {/* 2. Bento Grid Pastel Cards - Reduced Sizes */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-2.5">
         <button title="Toàn bộ phòng" onClick={() => navigate('/properties')} className="bg-[#E6F0FA] rounded-2xl p-2.5 flex flex-col justify-between h-[82px] active:scale-[0.98] transition-all text-left">
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Toàn bộ<br/>Phòng</span>
              <div className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-blue-600 shrink-0">
                <Building2 size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex justify-between items-end w-full">
               <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Cập nhật lúc<br/>{new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
               <span className="text-xl font-black text-slate-800 tracking-tight leading-none">{stats.total}</span>
            </div>
         </button>

         <button title="Quản lý Chủ nhà" onClick={() => navigate('/properties?tab=owners')} className="bg-[#E2F5E9] rounded-2xl p-2.5 flex flex-col justify-between h-[82px] active:scale-[0.98] transition-all text-left">
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Quản lý<br/>Chủ nhà</span>
              <div className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-emerald-600 shrink-0">
                <Users size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex justify-between items-end w-full">
               <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Đối tác<br/>cung cấp</span>
               <span className="text-xl font-black text-slate-800 tracking-tight leading-none">{stats.owners}</span>
            </div>
         </button>

         <button title="Phòng Đã thuê" onClick={() => navigate('/properties?status=Rented')} className="bg-[#FFEFEF] rounded-2xl p-2.5 flex flex-col justify-between h-[82px] active:scale-[0.98] transition-all text-left">
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Đang<br/>Nắm giữ</span>
              <div className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-rose-500 shrink-0">
                <CheckCircle2 size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex justify-between items-end w-full">
               <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Tỷ lệ lấp<br/>đầy tốt</span>
               <span className="text-xl font-black text-slate-800 tracking-tight leading-none">{stats.rented}</span>
            </div>
         </button>

         <button title="Phòng Trống" onClick={() => navigate('/properties?status=Available')} className="bg-[#FFF4E0] rounded-2xl p-2.5 flex flex-col justify-between h-[82px] active:scale-[0.98] transition-all text-left">
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Phòng<br/>Trống</span>
              <div className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-amber-500 shrink-0">
                <Home size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex justify-between items-end w-full">
               <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Sẵn sàng<br/>cho thuê</span>
               <span className="text-xl font-black text-slate-800 tracking-tight leading-none">{stats.available}</span>
            </div>
         </button>
      </section>

      {/* 4. Tin tức Thị trường (News Feed Carousel) */}
      <section className="mt-6 pl-5 overflow-hidden">
        <div className="flex items-center justify-between mb-2 pr-5">
          <h3 className="text-[13px] font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Newspaper size={14} className="text-blue-600" /> Bản tin Thị trường
          </h3>
        </div>

        <div className="flex overflow-x-auto gap-2.5 pb-4 pr-5 custom-scrollbar snap-x">
          {newsLoading ? (
            // Skeleton Loading
            [1, 2, 3].map((n) => (
              <div key={n} className="w-[160px] shrink-0 bg-slate-50 rounded-[1.25rem] p-2 border border-slate-100 snap-center animate-pulse">
                <div className="w-full h-[80px] bg-slate-200 rounded-xl mb-2"></div>
                <div className="h-2.5 bg-slate-200 rounded-full w-full mb-1"></div>
                <div className="h-2.5 bg-slate-200 rounded-full w-2/3"></div>
              </div>
            ))
          ) : news.length > 0 ? (
            // News Items
            news.map((item, index) => (
              <a 
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                title={item.title}
                className="w-[180px] shrink-0 bg-white rounded-[1.25rem] p-2 border border-slate-100 shadow-sm snap-center active:scale-95 transition-all text-left block"
              >
                <div className="w-full h-[90px] rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <h4 className="text-[10px] font-bold text-slate-800 leading-snug line-clamp-2 mb-1 px-1">{item.title}</h4>
                <p className="text-[8px] text-slate-400 font-semibold px-1">{new Date(item.pubDate).toLocaleDateString('vi-VN')}</p>
              </a>
            ))
          ) : (
             <div className="w-full py-6 mr-5 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Không có dữ liệu tin tức</p>
             </div>
          )}
        </div>
      </section>

      {/* 3. Alerts - Flat UI list */}
      <section className="px-5 mt-2">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Cần xử lý ngay</h3>
          <button title="Xem tất cả" onClick={() => navigate('/notifications')} className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest active:scale-95 transition-all">Tất cả</button>
        </div>

        <div className="space-y-0 text-left">
          {stats.allAlerts.length > 0 ? stats.allAlerts.slice(0, 3).map((alert, idx) => (
             <button title={alert.propertyName} key={alert.id} onClick={() => navigate(`/property/${alert.propertyId}`)} className={`w-full flex items-center py-3 group active:opacity-70 transition-opacity ${idx !== Math.min(stats.allAlerts.length, 3) - 1 ? 'border-b border-slate-50' : ''}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2.5 shrink-0 border ${
                   alert.type.includes('ELECTRICITY') ? 'bg-amber-50 text-amber-500 border-amber-100' :
                   alert.type.includes('WATER') ? 'bg-cyan-50 text-cyan-500 border-cyan-100' :
                   alert.type.includes('WIFI') ? 'bg-indigo-50 text-indigo-500 border-indigo-100' :
                   'bg-rose-50 text-rose-500 border-rose-100'
               }`}>
                  <AlertTriangle size={14} className="currentColor"/>
               </div>
               <div className="flex-1 text-left min-w-0 pr-2">
                 <h4 className="text-[11px] font-bold text-slate-800 truncate">{alert.propertyName}</h4>
                 <p className="text-[9px] text-slate-500 font-medium truncate mt-0.5">{alert.message}</p>
               </div>
               <ArrowRight size={14} className="text-slate-300 opacity-50 group-hover:opacity-100 transition-all"/>
             </button>
          )) : (
             <div className="py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 mt-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tất cả đều ổn định</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
