
import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, User, Search, Calendar, Plus, Home } from 'lucide-react';
import { getPropertyAlerts } from '../utils/alertUtils';
import { useAppContext } from '../data/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { properties, profile } = useAppContext();
  const [totalAlerts, setTotalAlerts] = React.useState(0);

  const isFormPage = 
    location.pathname.includes('/property/new') || 
    location.pathname.includes('/property/edit') ||
    location.pathname.includes('/owner/new') ||
    location.search.includes('add=true');

  React.useEffect(() => {
    const count = properties.flatMap((p: any) => getPropertyAlerts(p)).length;
    setTotalAlerts(count);
  }, [properties]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl overflow-hidden border-x border-slate-200 relative">
      {/* Header */}
      <header className="bg-slate-50/80 backdrop-blur-xl pt-safe sticky top-0 z-50 transition-all duration-300 pb-2">
        <div className="px-5 pt-4 pb-1 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none flex items-center gap-2">
              <img src="/rentmaster_logo.png" alt="Logo" className="w-7 h-7 rounded-[8px] object-cover shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100" />
              RentMaster <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {!isFormPage && (
              <button title="Quản lý nhà" onClick={() => navigate('/properties')} className="w-10 h-10 bg-white text-slate-800 flex items-center justify-center rounded-full active:scale-95 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100">
                <Home size={18} strokeWidth={2.5} />
              </button>
            )}
            <button 
              title="Thông báo"
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center border border-slate-100 active:scale-95 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.04)]"
            >
              <Bell size={18} strokeWidth={2.5} />
              {totalAlerts > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto custom-scrollbar bg-white ${!isFormPage ? 'pb-24 px-4 py-5' : ''}`}>
        {children}
      </main>

      {/* Navigation - Floating Dribbble Style */}
      {!isFormPage && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-6 pointer-events-none">
          <nav className="bg-[#383C43] rounded-full p-2 flex justify-between items-center shadow-2xl shadow-slate-900/30 pointer-events-auto relative">
            <NavLink 
              to="/" 
              className={({ isActive }) => `relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'bg-white text-slate-900 shadow-md scale-110' : 'text-slate-400 hover:text-white'}`}
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                  {isActive && <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white"></div>}
                </>
              )}
            </NavLink>

            <NavLink 
              to="/schedule" 
              className={({ isActive }) => `relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'bg-white text-slate-900 shadow-md scale-110' : 'text-slate-400 hover:text-white'}`}
            >
              {({ isActive }) => (
                <Calendar size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
              )}
            </NavLink>
            
            <button 
              title="Thêm mới dữ liệu"
              onClick={() => {
                if (location.pathname === '/schedule') {
                   navigate('/schedule?add=true');
                } else {
                   navigate('/property/new');
                }
              }} 
              className={`relative w-12 h-12 flex items-center justify-center rounded-full shadow-md active:scale-95 transition-all text-sm ${
                location.pathname === '/schedule' || location.pathname === '/properties'
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-white text-slate-900 border border-slate-100'
              }`}
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>

            <NavLink 
              to="/properties" 
              className={({ isActive }) => `relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'bg-white text-slate-900 shadow-md scale-110' : 'text-slate-400 hover:text-white'}`}
            >
              {({ isActive }) => (
                <Home size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
              )}
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => `relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'bg-white text-slate-900 shadow-md scale-110' : 'text-slate-400 hover:text-white'}`}
            >
              {({ isActive }) => (
                <User size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
              )}
            </NavLink>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Layout;
