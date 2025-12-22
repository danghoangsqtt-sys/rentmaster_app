
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, SlidersHorizontal, Plus, AlertCircle, 
  Building2, Users, Phone, X, Camera, Save, Trash2, Edit3, User, UserPlus
} from 'lucide-react';
import { getStoredProperties, getStoredOwners, saveOwners, saveProperties } from '../data/mockData';
import { getPropertyAlerts } from '../utils/alertUtils';
import { Property, Owner } from '../types';
import { StorageService } from '../services/StorageService';

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'properties' | 'owners'>(
    searchParams.get('tab') === 'owners' ? 'owners' : 'properties'
  );
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const p = await getStoredProperties();
    const o = await getStoredOwners();
    setProperties(p);
    setOwners(o);
  };

  const handleDeleteProperty = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bất động sản này? Toàn bộ thông tin khách thuê và hợp đồng liên quan sẽ bị mất.')) {
      const updated = properties.filter(p => p.id !== id);
      setProperties(updated);
      await saveProperties(updated);
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
      return matchesSearch && matchesCategory;
    });
  }, [properties, searchTerm, activeCategory]);

  const filteredOwners = useMemo(() => {
    return owners.filter(o => 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phones.some(p => p.includes(searchTerm))
    );
  }, [owners, searchTerm]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-full pb-32 transition-colors">
      <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-30 shadow-sm p-4 space-y-4">
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('properties')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'properties' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Bất động sản</button>
          <button onClick={() => setActiveTab('owners')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'owners' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Chủ sở hữu</button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" placeholder={activeTab === 'properties' ? "Tìm căn hộ, khách thuê..." : "Tìm chủ nhà..."} 
            className="w-full bg-slate-100 dark:bg-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {activeTab === 'properties' && (
          <>
            {filteredProperties.map((property) => (
              <div 
                key={property.id}
                onClick={() => navigate(`/property/${property.id}`)}
                className="bg-white dark:bg-slate-800 rounded-[2rem] p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 active:scale-[0.98] transition-all group"
              >
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shrink-0 border border-slate-50 dark:border-slate-600 relative">
                  <img src={StorageService.getDisplayUrl(property.imageUrl)} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => handleEditProperty(e, property.id)} className="p-1.5 bg-white text-blue-600 rounded-lg shadow-md"><Edit3 size={14} /></button>
                    <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-1.5 bg-white text-rose-600 rounded-lg shadow-md"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm truncate uppercase italic tracking-tight">{property.name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-1">
                        <MapPin size={10} className="text-blue-500" /> <span className="truncate">{property.address || property.structure}</span>
                      </div>
                      {property.tenant && (
                        <div className="flex items-center gap-1 mt-1 text-indigo-600 dark:text-indigo-400">
                           <User size={10} />
                           <p className="text-[10px] font-black uppercase truncate">{property.tenant.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${property.status === 'Rented' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                      {property.status === 'Rented' ? 'Đã thuê' : 'Trống'}
                    </span>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">
                      {(property.tenant?.rentAmount || 0).toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'owners' && (
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/owner/new')}
              className="w-full p-4 bg-white dark:bg-slate-800 rounded-[1.75rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all group"
            >
              <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600">
                <UserPlus size={18} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Thêm chủ sở hữu mới</span>
            </button>

            {filteredOwners.map(owner => (
              <div key={owner.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md bg-slate-100">
                  {owner.avatarUrl ? (
                    <img src={StorageService.getDisplayUrl(owner.avatarUrl)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate">{owner.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                    <Phone size={10} />
                    <p className="text-[10px] font-bold">{owner.phones[0]}</p>
                  </div>
                  {owner.address && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                      <MapPin size={10} />
                      <p className="text-[9px] font-bold truncate italic">{owner.address}</p>
                    </div>
                  )}
                </div>
                <a href={`tel:${owner.phones[0]}`} className="w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-all shrink-0">
                  <Phone size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
        
        {((activeTab === 'properties' && filteredProperties.length === 0) || (activeTab === 'owners' && filteredOwners.length === 0)) && (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
             </div>
             <p className="text-slate-300 dark:text-slate-600 font-black uppercase italic text-xs tracking-widest">Không tìm thấy kết quả</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
