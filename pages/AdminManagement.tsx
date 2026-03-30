
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, ShieldCheck, Search, Zap, 
  CheckCircle2, XCircle, Mail, Calendar, 
  Users, Award, Filter, MoreHorizontal, 
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { getStoredUsers, saveUsersList } from '../data/mockData';
import { UserAccount } from '../types';

const AdminManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pro' | 'free'>('all');

  // Fix: getStoredUsers returns a Promise, so it must be awaited before setting state.
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getStoredUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    return {
      total: users.length,
      pro: users.filter(u => u.isPro).length,
      free: users.filter(u => !u.isPro).length
    };
  }, [users]);

  const toggleProStatus = (email: string) => {
    const updatedUsers = users.map(u => {
      if (u.email === email) {
        return { ...u, isPro: !u.isPro };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveUsersList(updatedUsers);
    
    // Đồng bộ LocalStorage nếu là chính admin
    const currentUserStr = localStorage.getItem('rentMasterUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.email === email) {
        localStorage.setItem('rentMasterUser', JSON.stringify({ ...currentUser, isPro: !currentUser.isPro }));
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'pro' && u.isPro) || 
                          (filter === 'free' && !u.isPro);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-full bg-slate-50 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button title="Quay lại" onClick={() => navigate(-1)} className="p-1.5 bg-slate-50 rounded-lg text-slate-500 active:scale-90 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Quản trị hệ thống</h2>
        </div>
        <button title="Tùy chọn" className="p-2 bg-slate-50 text-slate-400 rounded-lg">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <Users size={16} />
            </div>
            <h4 className="text-2xl font-black text-slate-900">{stats.total}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Người dùng</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
              <Award size={16} />
            </div>
            <h4 className="text-2xl font-black text-slate-900">{stats.pro}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Tài khoản PRO</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc email..." 
              className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <FilterButton active={filter === 'all'} label="Tất cả" onClick={() => setFilter('all')} />
            <FilterButton active={filter === 'pro'} label="Gói Pro" onClick={() => setFilter('pro')} />
            <FilterButton active={filter === 'free'} label="Gói Thường" onClick={() => setFilter('free')} />
          </div>
        </div>

        {/* User List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách kích hoạt</h3>
            <span className="text-[9px] font-bold text-slate-300 uppercase">{filteredUsers.length} kết quả</span>
          </div>

          {filteredUsers.length > 0 ? filteredUsers.map((user) => (
            <div key={user.email} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm shrink-0">
                    <img src={user.photo || 'https://picsum.photos/seed/user/100'} className="w-full h-full object-cover" alt={user.name} />
                  </div>
                  {user.isPro && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-md shadow-sm">
                      <Zap size={8} className="fill-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 uppercase truncate leading-none mb-1">{user.name}</h4>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <Mail size={10} className="text-slate-400" />
                    <p className="text-[9px] text-slate-500 font-bold truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleProStatus(user.email)}
                  className={`px-3 py-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 min-w-[64px] ${
                    user.isPro 
                      ? 'bg-amber-50 border-amber-200 text-amber-600' 
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {user.isPro ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                  <span className="text-[8px] font-black uppercase">{user.isPro ? 'Hủy Pro' : 'Dùng Pro'}</span>
                </button>
                <button title="Chi tiết" className="p-2 text-slate-300 hover:text-blue-500 group-hover:translate-x-0.5 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                <Users size={32} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                Không tìm thấy người dùng phù hợp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// UI Components
const FilterButton = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight whitespace-nowrap transition-all border ${
      active 
        ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' 
        : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

export default AdminManagement;
