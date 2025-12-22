
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, SlidersHorizontal, Plus, AlertCircle, 
  Building2, Users, Phone, X, Camera, Save, Trash2, Edit3, User
} from 'lucide-react';
import { getStoredProperties, getStoredOwners, saveOwners, saveProperties } from '../data/mockData';
import { getPropertyAlerts } from '../utils/alertUtils';
import { Property, Owner } from '../types';
import { StorageService } from '../services/StorageService';

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'properties' | 'owners'>('properties');
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
      const matchesSearch = p.name.toLowerCase().includes(searchStr);
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
    <div className="bg-slate-50 dark:bg-slate-900 min-h-full pb-24 transition-colors">
      <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-30 shadow-sm p-4 space-y-4">
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('properties')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'properties' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Bất động sản</button>
          <button onClick={() => setActiveTab('owners')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'owners' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Chủ sở hữu</button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" placeholder={activeTab === 'properties' ? "Tìm căn hộ..." : "Tìm chủ nhà..."} 
            className="w-full bg-slate-100 dark:bg-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {activeTab === 'properties' && filteredProperties.map((property) => (
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
                </div>
                <div className="flex flex-col gap-1 items-end md:hidden">
                   <button onClick={(e) => handleEditProperty(e, property.id)} className="text-blue-500 p-1"><Edit3 size={14}/></button>
                   <button onClick={(e) => handleDeleteProperty(e, property.id)} className="text-rose-500 p-1"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
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

        {activeTab === 'owners' && filteredOwners.map(owner => (
           <div key={owner.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
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
        
        {((activeTab === 'properties' && filteredProperties.length === 0) || (activeTab === 'owners' && filteredOwners.length === 0)) && (
          <div className="py-20 text-center text-slate-300 font-black uppercase italic text-xs">Không tìm thấy kết quả</div>
        )}
      </div>

      <button 
        onClick={() => navigate(activeTab === 'properties' ? '/property/new' : '/owner/new')} 
        className="fixed bottom-24 right-5 w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800 z-50 active:scale-90 transition-all"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default PropertyList;
