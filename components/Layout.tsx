
import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, User, Search, PlusCircle, Calendar, ListChecks } from 'lucide-react';
import { getStoredProperties, getStoredProfile } from '../data/mockData';
import { getPropertyAlerts } from '../utils/alertUtils';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [totalAlerts, setTotalAlerts] = React.useState(0);
  const [profile, setProfile] = React.useState<any>(null);

  const isFormPage = 
    location.pathname.includes('/property/new') || 
    location.pathname.includes('/property/edit') ||
    location.pathname.includes('/owner/new') ||
    location.search.includes('add=true');

  React.useEffect(() => {
    const loadData = async () => {
      const props = await getStoredProperties();
      const count = props.flatMap(p => getPropertyAlerts(p)).length;
      setTotalAlerts(count);
      const prof = await getStoredProfile();
      setProfile(prof);
    };
    loadData();
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 dark:bg-slate-900 shadow-2xl overflow-hidden border-x border-slate-200 dark:border-slate-800 relative">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 glass-effect pt-safe sticky top-0 z-50 border-b border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300">
        <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                RentMaster <span className="text-blue-600 dark:text-blue-400">Pro</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.15em]">
                Smart Management
              </p>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-100 dark:border-slate-600 active:scale-95 transition-all shadow-sm"
              >
                <Bell size={18} />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 font-black animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-600 shadow-md overflow-hidden active:scale-95 transition-all bg-slate-100"
              >
                <img src={profile?.photo || "https://i.pravatar.cc/150?u=manager"} className="w-full h-full object-cover" alt="Profile" />
              </button>
            </div>
          </div>

          {!isFormPage && (
            <div 
              onClick={() => navigate('/properties')}
              className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-[1.25rem] px-4 py-3 text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
            >
              <Search size={16} />
              <span className="text-[13px] font-medium">Tìm căn hộ, cư dân, chủ nhà...</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC] dark:bg-slate-900 ${!isFormPage ? 'pb-28 px-5 py-6' : ''}`}>
        {children}
      </main>

      {/* Navigation */}
      {!isFormPage && (
        <nav className="fixed bottom-0 w-full max-w-md glass-effect border-t border-slate-100 dark:border-slate-800 px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_25px_rgba(0,0,0,0.05)] transition-all duration-300">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">Tổng quan</span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/schedule" 
            className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
          >
            {({ isActive }) => (
              <>
                <Calendar size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">Lịch trình</span>
              </>
            )}
          </NavLink>
          
          <button 
            onClick={() => navigate('/property/new')} 
            className="flex flex-col items-center -mt-10"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.75rem] shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center active:scale-90 hover:scale-105 transition-all border-[4px] border-white dark:border-slate-800">
              <PlusCircle size={30} />
            </div>
          </button>

          <NavLink 
            to="/properties" 
            className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
          >
            {({ isActive }) => (
              <>
                <ListChecks size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">Danh sách</span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/profile" 
            className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
          >
            {({ isActive }) => (
              <>
                <User size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">Cá nhân</span>
              </>
            )}
          </NavLink>
        </nav>
      )}
    </div>
  );
};

export default Layout;
