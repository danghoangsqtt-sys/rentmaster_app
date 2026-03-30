
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, SlidersHorizontal, Plus, AlertCircle, Home,
  Building2, Users, Phone, X, Camera, Save, Trash2, Edit3, User, UserPlus, MessageSquare
} from 'lucide-react';
import { getPropertyAlerts } from '../utils/alertUtils';
import { Property, Owner } from '../types';
import { StorageService } from '../services/StorageService';
import { useAppContext } from '../data/AppContext';

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { properties, owners, updateProperties, updateOwners } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'properties' | 'owners'>(
    searchParams.get('tab') === 'owners' ? 'owners' : 'properties'
  );
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeStatus, setActiveStatus] = useState(searchParams.get('status') || 'Tất cả');

  const handleDeleteProperty = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bất động sản này? Toàn bộ thông tin khách thuê và hợp đồng liên quan sẽ bị mất.')) {
      const updated = properties.filter(p => p.id !== id);
      await updateProperties(updated);
    }
  };

  const handleDeleteOwner = async (id: string, ownedCount: number) => {
    if (ownedCount > 0) {
      alert(`Không thể xóa do chủ nhà này đang sở hữu ${ownedCount} dự án. Vui lòng gỡ liên kết BĐS trước!`);
      return;
    }
    if (window.confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn xóa chủ nhà này không?')) {
      const updated = owners.filter(o => o.id !== id);
      await updateOwners(updated);
    }
  };

  const handleEditProperty = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/property/edit/${id}`);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchStr) || 
                           (p.tenant?.name || '').toLowerCase().includes(searchStr);
      const matchesCategory = activeCategory === 'Tất cả' || p.type === activeCategory;
      const matchesStatus = activeStatus === 'Tất cả' || p.status === activeStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [properties, searchTerm, activeCategory, activeStatus]);

  const filteredOwners = useMemo(() => {
    return owners.filter(o => 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phones.some(p => p.includes(searchTerm))
    );
  }, [owners, searchTerm]);

  return (
    <div className="bg-white min-h-full pb-32 transition-colors">
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-40 pt-1 pb-1 shadow-sm border-b border-slate-100">
        <div className="px-5 mb-1.5 mt-0 flex items-center justify-between">
           <h2 className="text-[13px] font-black text-slate-800 tracking-tight flex items-center gap-2">
             <Building2 className="text-blue-600" size={14} /> Danh Mục Dữ Liệu
           </h2>
        </div>
        
        <div className="px-5 mt-0">
          <div className="flex bg-slate-100/80 p-0.5 rounded-[12px]">
            <button onClick={() => setActiveTab('properties')} className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-widest rounded-[10px] transition-all ${activeTab === 'properties' ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'}`}>BĐS ({properties.length})</button>
            <button onClick={() => setActiveTab('owners')} className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-widest rounded-[10px] transition-all ${activeTab === 'owners' ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'}`}>Chủ ({owners.length})</button>
          </div>
        </div>

        <div className="px-5 mt-2 mb-1.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text" placeholder={activeTab === 'properties' ? "Tìm theo tên, khách thuê..." : "Tìm tên, sđt chủ nhà..."} 
              className="w-full bg-slate-50 rounded-[12px] py-1.5 pl-9 pr-3 text-[11px] font-bold outline-none border border-slate-100 placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {activeTab === 'properties' && (
           <>
             <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-1.5 px-5 pb-0.5 snap-x">
                {['Tất cả', 'Apartment', 'House', 'Hotel'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveCategory(f)}
                    className={`px-2.5 py-1 rounded-[8px] text-[8px] font-bold uppercase whitespace-nowrap transition-all border snap-center ${
                      activeCategory === f ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'Tất cả' ? 'Tất cả' : f === 'Apartment' ? '🏢 Chung cư' : f === 'House' ? '🏠 Nhà trọ' : '🏨 Khách sạn'}
                  </button>
                ))}
             </div>
             <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-0.5 px-5 pb-2 snap-x">
                {['Tất cả', 'Available', 'Rented', 'Sold'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveStatus(f)}
                    className={`px-2.5 py-1 rounded-[8px] text-[8px] font-bold uppercase whitespace-nowrap transition-all border snap-center ${
                      activeStatus === f ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm' : 'bg-white text-slate-400 border-slate-100/80 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'Tất cả' ? 'Mọi trạng thái' : f === 'Available' ? 'Phòng Trống' : f === 'Rented' ? 'Đã cho thuê' : 'Đã bán (Sold)'}
                  </button>
                ))}
             </div>
           </>
        )}
      </div>

      <div className="p-4 pt-3 space-y-3">
        {activeTab === 'properties' && (
          <>
            {filteredProperties.map((property) => (
              <div 
                key={property.id}
                onClick={() => navigate(`/property/${property.id}`)}
                className="bg-white rounded-[20px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-4 active:scale-[0.98] transition-all group"
              >
                <div className="w-[90px] h-[90px] rounded-[14px] overflow-hidden shrink-0 border border-slate-50 relative bg-slate-50 shadow-inner">
                  <img src={StorageService.getDisplayUrl(property.imageUrl)} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-x-0 bottom-0 pb-1.5 pt-4 bg-gradient-to-t from-slate-900/80 to-transparent flex justify-center">
                    <span className="text-[8px] font-black text-white/90 uppercase tracking-widest">{property.type === 'Apartment' ? 'Chung cư' : property.type === 'Hotel' ? 'Khách sạn' : 'Nhà phố'}</span>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button title="Chỉnh sửa" onClick={(e) => handleEditProperty(e, property.id)} className="w-7 h-7 flex items-center justify-center bg-white text-blue-600 rounded-full shadow-lg active:scale-90"><Edit3 size={12} /></button>
                    <button title="Xóa" onClick={(e) => handleDeleteProperty(e, property.id)} className="w-7 h-7 flex items-center justify-center bg-white text-rose-600 rounded-full shadow-lg active:scale-90"><Trash2 size={12} /></button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 py-0.5 flex flex-col">
                  <h4 className="font-black text-slate-800 text-[12px] uppercase tracking-tight line-clamp-1">{property.name}</h4>
                  
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                    <MapPin size={10} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-medium truncate italic tracking-tight">{property.address || property.structure}</span>
                  </div>
                  
                  {property.tenant && (
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                       <User size={10} className="text-indigo-400 shrink-0" />
                       <span className="text-[10px] font-bold text-slate-700 truncate">{property.tenant.name}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-[8px] border ${
                      property.status === 'Rented' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 
                      property.status === 'Sold' ? 'bg-amber-50 text-amber-600 border-amber-200/50' :
                      'bg-slate-50 text-slate-500 border-slate-200/50'
                    }`}>
                      {property.status === 'Rented' ? 'Đã thuê' : property.status === 'Sold' ? 'Đã bán' : 'Trống'}
                    </span>
                    <span className="text-[13px] font-black text-blue-600 tracking-tight">
                      {((property.tenant?.rentAmount) || 0).toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'owners' && (
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/owner/new')}
              className="w-full p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all group"
            >
              <div className="p-1.5 bg-white rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 shadow-sm">
                <UserPlus size={16} />
              </div>
              <span className="text-xs font-semibold">Thêm chủ nhà mới</span>
            </button>

            {filteredOwners.map(owner => {
              const ownedCount = properties.filter(p => p.ownerId === owner.id).length;
              return (
              <div key={owner.id} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-3 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm bg-gradient-to-tr from-blue-100 to-indigo-50 border border-slate-100 shrink-0">
                    {owner.avatarUrl ? (
                      <img src={StorageService.getDisplayUrl(owner.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-500/50">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate">{owner.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                       <div className="flex items-center gap-1 text-slate-500">
                         <Building2 size={10} className="text-blue-400" />
                         <span className="text-[10px] font-bold">{ownedCount} BĐS</span>
                       </div>
                       <div className="flex items-center gap-1 text-slate-500">
                         <Phone size={10} className="text-emerald-400" />
                         <span className="text-[10px] font-bold">{owner.phones[0]}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-2">
                     <button title="Sửa" onClick={() => navigate(`/owner/edit/${owner.id}`)} className="px-3 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-1.5 shadow-sm hover:bg-blue-100 active:scale-95 transition-transform text-[10px] font-bold uppercase">
                       <Edit3 size={12} /> Sửa
                     </button>
                     <button title="Xóa" onClick={() => handleDeleteOwner(owner.id, ownedCount)} className="px-3 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center gap-1.5 shadow-sm hover:bg-rose-100 active:scale-95 transition-transform text-[10px] font-bold uppercase">
                       <Trash2 size={12} /> Xoá
                     </button>
                  </div>

                  <div className="flex gap-2 shrink-0">
                     <a title="Nhắn tin" href={`sms:${owner.phones[0]}`} className="w-8 h-8 rounded-full bg-slate-50 text-indigo-600 border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                       <MessageSquare size={12} fill="currentColor" className="opacity-80" />
                     </a>
                     <a title="Gọi điện" href={`tel:${owner.phones[0]}`} className="w-8 h-8 rounded-full bg-slate-50 text-emerald-600 border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                       <Phone size={12} fill="currentColor" className="opacity-80" />
                     </a>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
        
        {((activeTab === 'properties' && filteredProperties.length === 0) || (activeTab === 'owners' && filteredOwners.length === 0)) && (
          <div className="py-20 text-center">
             <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100 shadow-sm">
                <Home size={20} />
             </div>
             <p className="text-slate-400 font-medium text-xs">Không có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
